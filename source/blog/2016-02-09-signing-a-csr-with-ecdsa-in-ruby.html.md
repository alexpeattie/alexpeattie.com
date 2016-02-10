---
title: Signing a CSR with an ECDSA key in Ruby
---

Let's Encrypt just [rolled out support](https://community.letsencrypt.org/t/ecdsa-testing-on-staging/8809) for ECDSA certificates in staging - a move that I think will nudge ECDSA signing more into the mainstream. ECDSA offers higher levels of security at much lower key sizes; as Ivan Ristić explains in [Bulletproof SSL and TLS](https://www.feistyduck.com/books/bulletproof-ssl-and-tls/):

> ECDSA is the algorithm of the future. A 256-bit ECDSA key provides 128 bits of security versus only 112 bits of a 2,048-bit RSA key. At these sizes, in addition to pro- viding more security, ECDSA is also 2x faster. Compared at equivalent security, against a 3,072-bit RSA key, ECDSA is over 6x faster.

All modern browsers [prefer cipher suites](https://www.ssllabs.com/ssltest/viewMyClient.html) using ECDSA keys over RSA keys, although some older clients (IE 10 and older, Android < 4.4) don't support them; and neither do certain cloud-based servers (I tried and failed with AWS and Netlify 😔).

If you are entering the exciting world of ECDSA with Ruby there are a couple of pitfalls to avoid. Let's look at the code for generating a Certificate Signing Request (CSR) with an RSA key:

~~~ruby
domain_key = OpenSSL::PKey::RSA.new(2048)

csr = OpenSSL::X509::Request.new
csr.subject = OpenSSL::X509::Name.new([['CN', 'alexpeattie.com']])
csr.public_key = domain_key.public_key
csr.sign domain_key, OpenSSL::Digest::SHA256.new
~~~

Ruby comes with a [`OpenSSL::PKey::EC` class](http://ruby-doc.org/stdlib-2.3.0/libdoc/openssl/rdoc/OpenSSL/PKey/EC.html) so the optimist in us might guess we could just swap out all instances of `OpenSSL::PKey::RSA` with `OpenSSL::PKey::EC`:

~~~ruby
ec_domain_key = OpenSSL::PKey::EC.new('secp384r1')

csr = OpenSSL::X509::Request.new
csr.subject = OpenSSL::X509::Name.new([['CN', 'alexpeattie.com']])
csr.public_key = ec_domain_key.public_key
csr.sign ec_domain_key, OpenSSL::Digest::SHA256.new
~~~

If only life were that simple - in fact we'll need to make a few tweaks to get our CSR working. The first problem is that the `public_key` and `private_key` aren't populated when we instantiate the `ec_domain_key`, we have to populate them with the [`generate_key`](http://ruby-doc.org/stdlib-2.3.0/libdoc/openssl/rdoc/OpenSSL/PKey/EC.html#method-i-generate_key) method:

~~~ruby
ec_domain_key.public_key
#= > nil

ec_domain_key.generate_key; ec_domain_key.public_key
#=> #<OpenSSL::PKey::EC::Point:0x007fdbece64f90 @group=#<OpenSSL::PKey::EC::Group:0x007fdbece64fb8 @key=#<OpenSSL::PKey::EC:0x007fdbece94880 @group=#<OpenSSL::PKey::EC::Group:0x007fdbece64fb8 ...>>>>
~~~

The next problem comes when we try and set the `public_key` of the CSR:

~~~ruby
csr.public_key = ec_domain_key.public_key
# TypeError: wrong argument (OpenSSL::PKey::EC::Point)! (Expected kind of OpenSSL::PKey::PKey)
~~~

As the error message tells us, `ec_domain_key.public_key` is returning an `OpenSSL::PKey::EC::Point` which doesn't work with our CSR.

~~~ruby
ec_domain_key.is_a? OpenSSL::PKey::PKey
#=> true

ec_domain_key.public_key.is_a? OpenSSL::PKey::PKey
#=> false
~~~

We could just use our whole `ec_domain_key` as our `csr.public_key` - this has no bad consequences as far as I can tell, but this would be a bit confusing: `ec_domain_key` is really a private key. A better workaround is to create a second instance of `OpenSSL::PKey::EC` to act as our public key, then copy over the public part of `ec_domain_key`:

~~~ruby
ec_domain_key, ec_public = OpenSSL::PKey::EC.new('secp384r1'), OpenSSL::PKey::EC.new('secp384r1')
ec_domain_key.generate_key

ec_public.public_key = ec_domain_key.public_key
ec_public.private_key
#=> nil
~~~

The last issue is that during when we call `.sign`, Ruby internally calls the `.private?` method on our signing keys. The problem is that for `OpenSSL::PKey::EC` the method is named `.private_key?` (argh!). This is [a known issue](https://redmine.ruby-lang.org/issues/5600), but luckily quite easy to monkey-patch with `alias_method`:

~~~ruby
OpenSSL::PKey::EC.send(:alias_method, :private?, :private_key?)
~~~

Our final code to generate an Certificate Signing Request with ECDSA keys in Ruby looks like this:

~~~ruby
OpenSSL::PKey::EC.send(:alias_method, :private?, :private_key?)

ec_domain_key, ec_public = OpenSSL::PKey::EC.new('secp384r1'), OpenSSL::PKey::EC.new('secp384r1')
ec_domain_key.generate_key
ec_public.public_key = ec_domain_key.public_key

csr = OpenSSL::X509::Request.new
csr.subject = OpenSSL::X509::Name.new([['CN', 'alexpeattie.com']])
csr.public_key = ec_public
csr.sign ec_domain_key, OpenSSL::Digest::SHA256.new
~~~