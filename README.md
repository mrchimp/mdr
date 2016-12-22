# mdr #

[![NPM version](https://badge.fury.io/js/mdr.svg)](http://badge.fury.io/js/mdr)

Markdown reader with color

# Requirements #

  * [Node](http://nodejs.org/)
  * npm (comes bundled with Node)

## Installation ##

Install the `mdr` command globally

    npm install -g mdr

## Usage ##

    mdr [file] [[-g github_repo | -b bitbucket_repo] [-B] | -h | -v] [-i] [-s]

The first parameter should be a file name or url. If not provided, this will default to `README.md`. `github_repo` and `bitbucket_repo` should be in the format `user/rpo` e.g. `mrchimp/mdr`.

Here are some things you can do:

    mdr                            # Show README.md from current directory
    mdr foo.md -i                  # Use dark-on-light style
    mdr http://example.com/foo.md  # Show foo.md from a the web
    mdr -g mrchimp/mdr             # Show README.md from Github repo
    mdr foo.md -b bar/bar          # Show foo.md from Bitbucket repo
    mdr -n mdr                     # Show readme from NPM package
    mdr -g mrchimp/mdr -B dev      # Show README.md from the dev branch
                                     of a Github repo

`mdr -h` for more help.
 

## Config ##

Config files are found and parsed by [rc](https://www.npmjs.org/package/rc). For example put the following content in `$HOME/.mdrrc` or `$HOME/.mdr/config`.

    {
        "invert": "true"
    }

See `rc` docs for more in-depth instructions.


## Notes ##

Italic and strikethrough aren't widely supported so I've made them coloured as well. They will show as italic and struck through where possible.


## Coverage ##

✔ = Implemented  
✘ = Not implemented

 * ✔ Paragraphs / Line Breaks
 * ✔ Headers
 * ✔ Blockquotes
 * ✔ Unordered Lists
 * ✔ Lists
 * ✔ Code Blocks
 * ✔ Code
 * ✔ Horizontal Rules
 * ✔ Links
 * ✔ Emphasis
 * ✔ Strong
 * ✔ Images (outputs `[$ALT_TEXT - $TITLE - $URL]`)
 * ✘ HTML
 * ✘ Nested Blockquotes
 * ✘ Ordered Lists (can't implement due to limitation in Marked)
 * ✘ Nested Lists


## Things I might get around to ##

* Improve pad() implementation
* Syntax highlighting for code blocks
* Detect italic support?

## Screenshot ##

![MDR Screenshot](http://i.imgur.com/QkwqnCl.png)
