#!/usr/bin/env node

var marked = require('marked'),
    chalk = require('chalk'),
    fs = require('fs'),
    ent = require('ent'),
    yargs = require('yargs')
        .usage('Render markdown files in color.')
        .example('readme.md -i', 'show readme.md with inverted colors')
        .help('help', 'test')
        .alias('f', 'file')
        .describe('f', 'File to display')
        .alias('i', 'invert')
        .describe('i', 'Use light on dark display')
        .alias('h', 'help')
        .describe('h', 'Show this help message')
        .argv;

var style,
    invert = yargs.invert,
    file_path = typeof yargs._[0] !== undefined ? yargs._[0] : null,
    rend = new marked.Renderer(),
    window_width = process.stdout.columns || 80,
    indent_size = 4,
    indent = repeat(' ', indent_size);

if (yargs.help) {
    console.log(yargs.showHelp());
    process.exit();
}

/*
 * Define Text Styles
 */
if (invert) {
    style = {
        // Block
        code:       chalk.white,
        blockquote: chalk.gray,
        html:       chalk.bgRed.gray,
        headings: [
            chalk.bgBlue.black.bold,
            chalk.bgGreen.black.bold,
            chalk.bgCyan.black.bold,
            chalk.bgMagenta.black.bold,
            chalk.bgYellow.black.bold,
            chalk.bgRed.black.bold,
        ],
        hr:         chalk.white,
        listbullet: chalk.gray,
        listitem:   chalk.white,
        p:          chalk.white,
        table:      chalk.gray,
        tablerow:   chalk.gray,
        tablecell:  chalk.gray,

        // Inline
        strong:   chalk.cyan,
        em:       chalk.yellow.dim.italic,
        codespan: chalk.inverse.dim.bold,
        del:      chalk.bgBlack.gray.strikethrough,
        link:     chalk.underline,
        image:    chalk.bgGreen.black.underline,
    }
} else {
    style = {
        // Block
        code:       chalk.black,
        blockquote: chalk.gray,
        html:       chalk.bgRed.gray,
        headings: [
            chalk.bgBlue.white.underline.bold,
            chalk.bgGreen.white.underline.bold,
            chalk.bgCyan.white.underline.bold,
            chalk.bgMagenta.white.underline.bold,
            chalk.bgYellow.white.underline.bold,
            chalk.bgRed.white.underline.bold
        ],
        hr:         chalk.black,
        listbullet: chalk.gray,
        listitem:   chalk.black,
        p:          chalk.black,
        table:      chalk.gray,
        tablerow:   chalk.gray,
        tablecell:  chalk.gray,

        // Inline
        strong:   chalk.cyan,
        em:       chalk.yellow.dim.italic,
        codespan: chalk.black.dim.bold,
        del:      chalk.bgWhite.gray.strikethrough,
        link:     chalk.underline,
        image:    chalk.bgGreen.black.underline,
    }
}

if (!file_path) {
    file_path = yargs.file;
}
if (!file_path) {
    console.log('No filename given. Looking for readme.md...');
    file_path = 'readme.md';
}


/**
 * Repeat a string
 * http://stackoverflow.com/a/5450113/130347
 * 
 * @param  {String} pattern String to repeat
 * @param  {Number} count   Number of times to repeat
 * @return {String}         Repeated string
 */
function repeat(pattern, count) {
    if (count < 1) return '';
    var result = '';
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result + pattern;
}

/**
 * Add a margin around a paragraph of text
 * @param  {String}  text         Original text
 * @param  {String}  gutter_str   Character to use as spacer
 * @param  {Integer} gutter_size  Number of characters to insert each side
 * @param  {Integer} width        Total width of line + spacers
 * @return {String}               Padded text
 */
function pad(text, gutter_str, gutter_size, width) { 
    var wrap_length = width - (2 * gutter_size),
        re = new RegExp('.{1,' + wrap_length + '}', 'g'),
        split = text.match(re),
        output = '';

    for (var x = 0; x < split.length; x++) {
        if (x == 0 ) {
            repeat(gutter_str, gutter_size - 2 ) + '" '
        } else {
            repeat(gutter_str, gutter_size)
        }
        output += split[x] + repeat(gutter_str, gutter_size) + '\n';
    }

    return output;
}


/*
 * Block Item Renderers
 */
rend.code = function(code, language) {
    var output = code.split('\n').join('\n' + indent)
    return style.p('\n') + style.code(indent + output) + style.p('\n');
};
rend.blockquote = function(quote) {
    // console.log(pad(quote, ' ', 4, window_width));
    return '\n' + pad(quote, ' ', 4, window_width);
    // return '#' + style.blockquote(quote) + '#';
    // return style.blockquote(pad(quote, ' ', 4, window_width));
};
rend.html = function(html) {
    return style.html(html + '\n\n');
};
rend.heading = function(text, level) {
    var full_text,
        output = '';

    level = Math.min(level, 6);

    full_text = indent + text + repeat(' ', window_width - text.length - 4);
    
    output = style.p('\n\n');
    output += style.headings[level - 1](full_text);
    output += '\n';
    
    return output;
};
rend.hr = function() {
    return '\n' + style.hr(repeat('―', window_width)) + '\n';
};
rend.list = function(body, ordered) {
    var x,
        output = '';

    return style.p('\n' + body);
};
rend.listitem = function(text) {
    return style.listitem(repeat(' ', indent_size - 2) + '• ' + text) + '\n';
};
rend.paragraph = function(text) {
    return style.p('\n' + ent.decode(text)) + '\n';
};
rend.table = function(header, body) {
    return 'TABLE';
};
rend.tablerow = function(content) {
    return 'TABLEROW';
};
rend.tablecell = function(content, flags) {
    return 'TABLECELL';
};


/*
 * Inline Item Renderers
 */ 
rend.strong = function(text) {
    return style.strong(text);
};
rend.em = function(text) {
    return style.em(text);
};
rend.codespan = function(code) {
    return style.codespan(' ' + code + ' ');
};
rend.br = function() {
    return '\n';
};
rend.del = function(text) {
    return style.del(text);
};
rend.link = function(href, title, text) {
    var output = style.link(text) + ' [' + href;

    if (title) {
        output += ' - ' + title;
    }

    output += ']';

    return output;
};
rend.image = function(href, title, text) {
    var output = '[';

    if (title) {
        output += title;
    } else {
        output += 'IMAGE';
    }

    if (text) {
        output += ' - ' + text;
    }

    output += ' - ' + href + ']';
    return style.image(output);
};


fs.readFile(file_path, 'utf8', function (err, data) {
    'use strict';

    if (err) {
        console.log('Couldn\'t open file.');
    }

    render(data);
});


function render(data) {
    'use strict';

    console.log(marked(data, {
        renderer: rend,
        smartLists: true,
        gfm: true
    }));
}
