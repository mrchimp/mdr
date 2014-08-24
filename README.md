# mdr #

Markdown reader with color

# Requirements #

  * [Node](http://nodejs.org/)
  * npm (comes bundled with Node)

## Usage ##

Install the `mdr` command globally

    npm install -g mdr

Then you can do the following...

    mdr                            # Show README.md from current directory
    mdr foo.md -i                  # Use dark-on-light style
    mdr http://example.com/foo.md  # Show foo.md from a the web
    mdr mrchimp/mdr -g             # Show README.md from Github repo

Do `mdr -h` for more help.
 

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
* Make paginatable - output content to `less -r` or something? Why doesn't this work? Colours get lost.
* Detect italic support?

## Screenshot ##

![MDR Screenshot](http://deviouschimp.co.uk/misc/rmd-screenshot.png)
