# rmd #

Display markdown files in color.


## Usage ##

Install the `rmd` command globally

    npm install -g

Then you can do the following...

    rmd                            # Show README.md from current directory
    rmd foo.md -i                  # Use dark-on-light style
    rmd http://example.com/foo.md  # Show foo.md from a the web
    rmd mrchimp/rmd -g             # Show README.md from Github repo

Do `rmd -h` for more help.
 

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

* Look for other readme filenames - reademe.md, README.markdown, readme.md etc
* Handle more than just utf8
* Improve pad() implementation
* Syntax highlighting for code blocks
* Pass command line arguments to marked, eg, gfm, breaks, 
* Make paginatable - output content to `less -r` or something? Why doesn't this work? Colours get lost.
* Detect italic support?
* Ordered lists 

## Screenshot ##

![RMD Screenshot](http://deviouschimp.co.uk/misc/rmd-screenshot.png)
