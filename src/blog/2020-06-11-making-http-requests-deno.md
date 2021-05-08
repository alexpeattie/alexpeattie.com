---
title: Making HTTP requests with Deno
image: /assets/images/meta/posts/making-http-requests-deno.png
---

Deno makes it easy to make client HTTP requests, using the web standard Fetch API. <!-- excerpt --> You can make a `GET` request in Deno like so:

```ts
---
filename: get-my-ip.ts
---
type IpifyResponse = {
  ip: String
}

const response = await fetch('https://api.ipify.org?format=json')
const ipData: IpifyResponse = await response.json()

console.log(`My IP is ${ipData.ip}`)
```

Since Deno is sandboxed by default, we'll need to explicitly allow HTTP requests by running our script with the `--allow-net` flag:

```sh
deno run --allow-net get-my-ip.ts

# My IP is 12.345.67.89
```

Deno's `fetch()` method follows the [same API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) as the version you'll find in modern browsers, so you can make other kinds of requests as you normally would:

```ts
const postRequest = await fetch('https://example.com/profile', {
  method: 'POST'
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ username: 'example' }),
})
```

Note that unlike in Node, we don't have to worry about importing `fetch` (it's exposed to the global scope by default), and we can use `await` at the top-level of our program (no [`async` IEFE](https://anthonychu.ca/post/async-await-typescript-nodejs/) required). I really appreciate these little touches, which I think make Deno a great choice for writing scripts to fetch and manipulate remote data.

### An aside on types

Defining a type for our expected HTTP response (`IpifyResponse`) is optional but recommended. It's worth emphasizing that type checker just ensures we're handling our response object in accordance with our type definition - it can't check our program actually matches the remote API. For example if we misspell `ip` as `pi`:

```ts
type IpifyResponse = {
  pi: String
}

const response = await fetch('https://api.ipify.org?format=json')
const ipData: IpifyResponse = await response.json()

console.log(`My IP is ${ipData.pi}`)
```

Our program compiles without complaint, since we consistently use our misspelt `pi` property throughout. But when we run it, it of course won't work as expected:

```sh
deno run --allow-net get-my-ip.ts

# My IP is undefined
```

If we want to extend the utility of our type definition, when we receive the response (at runtime) we can check whether the response has the shape we expect, and if not, throw a runtime error. TypeScript doesn't support this kind of runtime type checking natively, but there are several libraries including [io-ts](https://github.com/gcanti/io-ts) and [runtypes](https://github.com/pelotom/runtypes) which are designed to support this. The latter has an experimental [Deno fork](https://github.com/brandonkal/runtypes) which works well. We can extend our initial script to support runtime checking like so:

```ts
import { Static, Record, String } from 'https://deno.land/x/lib/runtypes.ts'

const IpifyResponse = Record({
  ip: String
})

type IpifyResponse = Static<typeof IpifyResponse>

try {
  const response = await fetch('https://api.ipify.org?format=json')
  const ipData: IpifyResponse = await response.json()

  IpifyResponse.check(ipData)

  console.log(`My IP is ${ipData.ip}`)
} catch (e) {
  console.error(e)
}
```

Now if we make our misspelling we'll get an runtime type validation error:

```ts
// ...
const IpifyResponse = Record({
  pi: String
})
// ...
console.log(`My IP is ${ipData.pi}`)

// => ValidationError: Expected string, but was undefined for key pi
```
