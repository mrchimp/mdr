# rmd #

Read Mark Down. Display markdown files in the terminal in color.


## Usage ##

Once the project is ready you'll be able to do the following...

    npm install -g

Then you can simply do...

   rmd readme.md

Or...

   rmd http://example.com/readme.md

That's about it.


## Coverage ##

✔ = Implemented  
✘ = Not implemented

 * ✔ Paragraphs / Line Breaks
 * ✔ Headers
 * ✘ HTML
 * ✔ Blockquotes
 * ✘ Nested Blockquotes
 * ✔ Unordered Lists
 * ✘ Ordered Lists (can't implement due to limitation in Marked)
 * ✔ Lists
 * ✘ Nested Lists
 * ✔ Code Blocks
 * ✔ Code
 * ✔ Horizontal Rules
 * ✔ Links
 * ✔ Emphasis
 * ✔ Strong
 * ✔ Images (outputs \[IMAGE\]\($URL\) instead)
 

## Notes ##

Italic and strike through aren't widely supported.


## Things I might get around to ##

* if no argument, lookfor readme.md or similar
* --gh load readme.md from github
* --bb load readme.md from bitbucket
* Improve pad() implementation
* Syntax highlighting
* Pass command line arguments to marked, eg, gfm, breaks, 
* smartypants?
* make paginatable - output content to `less -r` or something?
* Detect italic support?