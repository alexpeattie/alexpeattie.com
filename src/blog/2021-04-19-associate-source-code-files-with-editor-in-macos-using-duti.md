---
title: Quickly associate all source code files with your editor in macOS using <code>duti</code>
---

If you're a developer using macOS you've probably had the experience of double clicking, say, a `.js` file in Finder only to inadvertantly launch the wrong application, rather than your editor of choice. <!-- excerpt --> It's of course easy enough to change the association for a given file extension; per the Apple docs[^apple]:

- Control-click the file, then choose _Get Info_.
- In the _Info_ window, click the arrow next to _“Open with.”_
- Click the pop-up menu, then choose the app. To open all files of this type with this app, click _Change All_.

::figure[Choosing the application associated with a file extension using Finder is simple, but slow.]{url="/assets/images/posts/associate-source-code-files-with-editor-in-macos-using-duti/finder.png" width="500"}

However, if we want to associate all source code files with our editor, this becomes tedious. Even for a single language we might have many file extensions to go through (a file in a JavaScript project could have the extension `.js`, `.es`, `.es6`, `.cjs`, `.mjs`, `.jsx`, `.jsm` etc.). When setting up my macOS environment I wondered if there was a way to do this via the CLI, and via Nick Ficano's blog[^nick] I came across [`duti`](https://github.com/moretension/duti/)

### (TL;DR) How to associate file extensions for all programming languages with your editor

```bash
brew install duti python-yq
curl "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml" \
  | yq -r "to_entries | (map(.value.extensions) | flatten) - [null] | unique | .[]" \
  | xargs -L 1 -I "{}" duti -s com.microsoft.VSCode {} all
```

The above associates all source code extensions known to Github's [`linguist` library](https://github.com/github/linguist) with VSCode. If you use a different editor, substitute `com.microsoft.VSCode` with:

- Sublime Text: `com.sublimetext.3` (or, presumably, `com.sublimetext.4` for the forthcoming Sublime Text 4)
- Atom: `com.github.atom`
- IntelliJ: `com.jetbrains.intellij`
- Other: Find your editor's bundle ID by running: `lsappinfo | grep 'bundleID="' | cut -d'"' -f2 | sort`

To associate only extensions for the top ten programming languages[^survey] (that is: JavaScript, Python, Java, TypeScript, C#, PHP, C++, C, Shell scripts and Ruby) we can instead run:

```bash
curl "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml" \
  | yq -r '{JavaScript,Python,Java,TypeScript,"C#",PHP,"C++",C,Shell,Ruby} | to_entries | (map(.value.extensions) | flatten) - [null] | unique | .[]' \
  | xargs -L 1 -I "{}" duti -s com.microsoft.VSCode {} all
```

That's it, any source code files will now be opened in your editor of choice. (You might see an error `failed to set com.microsoft.VSCode as handler for public.html (error -54)` but this can be safely ignored[^publichtml]).

### How it works

[`duti`](https://github.com/moretension/duti) is a simple "does one thing well" utility that can associate a file extension[^uti] with an application (which we specify using its bundle ID) like so:

```bash
brew install duti
duti -s com.some.ApplicationBundleID .someext all
```

Equipped with `duti`, we just need an exhaustive list of file extensions - across all common programming languages - to feed it. Finding such a list turned out to be non-trivial. In the end I took the data from Github's `linguist` library, which keeps all programming languages known to Github collated in [a YAML file](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml). The file is very exhaustive and is updated [several times a week](https://github.com/github/linguist/commits/master/lib/linguist/languages.yml).

`languages.yml` looks like this:

<!-- prettier-ignore -->
```yaml
---
filename: languages.yml
---
# ...
Erlang:
  type: programming
  color: "#B83998"
  extensions:
  - ".erl"
  - ".app.src"
  - ".es"
  - ".escript"
  - ".hrl"
  - ".xrl"
  - ".yrl"
  filenames:
  - Emakefile
  - rebar.config
  - rebar.config.lock
  - rebar.lock
  tm_scope: source.erlang
  ace_mode: erlang
  codemirror_mode: erlang
  codemirror_mime_type: text/x-erlang
  interpreters:
  - escript
  language_id: 104
F#:
  type: programming
  color: "#b845fc"
  aliases:
  - fsharp
  extensions:
  - ".fs"
  - ".fsi"
  - ".fsx"
  tm_scope: source.fsharp
  ace_mode: text
  codemirror_mode: mllike
  codemirror_mime_type: text/x-fsharp
  language_id: 105
# ...
```

We're only interested in the `extensions` field for each programming language[^filenames]. We'll use [`yq`](https://kislyuk.github.io/yq/) - a [`jq`](https://stedolan.github.io/jq/) wrapper which can process YAML - to extract the file extensions for all known languages:

```bash
yq "to_entries | map(.value.extensions)" languages.yml
```

```json
[
  // ...
  [".rst", ".rest", ".rest.txt", ".rst.txt"],
  null,
  [".sed"],
  [".wdl"]
  // ...
]
```

Next we'll flatten this (`flatten`), remove `null` values (`- [null]`), and remove duplicates (`unique`):

```bash
yq "to_entries | (map(.value.extensions) | flatten) - [null] | unique" languages.yml
```

<!-- prettier-ignore -->
```json
[
  // ...
  ".apacheconf",
  ".apib",
  ".apl",
  ".app.src",
  ".applescript",
  ".arc",
  ".arpa",
  ".as",
  ".asax",
  ".asc",
  ".asciidoc",
  // ...
]
```

Next we add the `.[]` operator, and the `-r` (output raw strings) flag, to output our extensions as plaintext, one per line:

```bash
yq -r "to_entries | (map(.value.extensions) | flatten) - [null] | unique | .[]" languages.yml
```

```bash
# ...
.apacheconf
.apib
.apl
.app.src
.applescript
.arc
.arpa
.as
.asax
.asc
.asciidoc
# ...
```

Now we have something that we can pipe through to `xargs`. We use `-L 1` to specify that we should run our command for each line, and `-I "{}"` means we'll substitute `{}` with each extension in turn:

```bash
yq -r "to_entries | (map(.value.extensions) | flatten) - [null] | unique | .[]" languages.yml \
  | xargs -L 1 -I "{}" duti -s com.microsoft.VSCode {} all
```

Or reading `languages.yml` straight from Github:

```bash
curl "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml" \
  | yq -r "to_entries | (map(.value.extensions) | flatten) - [null] | unique | .[]" languages.yml \
  | xargs -L 1 -I "{}" duti -s com.microsoft.VSCode {} all
```

As well as being a big timesaver, I think the script above is a nice example of the [Unix philosophy](https://en.wikipedia.org/wiki/Unix_philosophy) in action. We have four simple programs which each do one thing well:

- `curl` to fetch the programming languages data from the `linguist` repo
- `yq` to process the YAML data
- `xargs` to run a command for each data point
- `duti` to set the file extension association

:::admonition[Update 2022]{kind="update"}
I've since come across (but not personally used) [`openwith`](https://github.com/jdek/openwith) which seems to have a simpler API than `duti` - h/t to Dennis Felsing's [blog post](https://hookrace.net/blog/macos-setup/) on his macOS setup.
:::

[^apple]: Source: [Apple: Choose an app to open a file on Mac](https://support.apple.com/guide/mac-help/choose-an-app-to-open-a-file-on-mac-mh35597/mac#mchlp0fea282)
[^nick]: Source: [Change Mac OS default file associations from the command line with duti](https://nickficano.com/blog/change-macos-default-file-associations-command-line-duti)
[^uti]: Or, more technically, a [Uniform Type Identifier](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/understanding_utis/understand_utis_intro/understand_utis_intro.html).
[^survey]: According to Github's [2020 State of the Octoverse survey](https://octoverse.github.com/#overview)
[^publichtml]: See this issue: [duti#29](https://github.com/moretension/duti/issues/29)
[^filenames]: Note that since I ignore the `.filenames` field, extensionless source code files like `Makefile` won't be associated with your editor. You could rerun the command with `.extensions` substituted in the `yq` command with `.filenames` if you wanted, although I haven't tested this.
