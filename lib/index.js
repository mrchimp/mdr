#!/usr/bin/env node

'use strict';

var marked = require('marked');
var chalk = require('chalk');
var fs = require('fs');
var pkg = require('../package.json');
var ent = require('ent');
var request = require('request');

var style,
    // invert = yargs.invert,
    // file_path = typeof yargs._[0] !== undefined ? yargs._[0] : null,
    rend = new marked.Renderer(),
    window_width = process.stdout.columns || 80,
    indent_size = 4,
    indent = repeat(' ', indent_size);

/**
 * Render some text
 * @param  {Object}   options
 * @param  {Function} callback
 * @return {Undefined}
 */
function run(options, callback) {
    rend.settings = options;

    if (typeof callback !== 'function') {
        callback = function(){};
    }

    if (options.help) {
        console.log(yargs.showHelp());
        process.exit();
    }

    /*
     * Define Text Styles
     */
    if (options.invert) {
        style = {
            // Block
            code:       chalk.black,
            blockquote: chalk.gray,
            html:       chalk.bgRed.gray,
            headings: [
                chalk.bgBlue.white.bold,
                chalk.bgGreen.white.bold,
                chalk.bgCyan.white.bold,
                chalk.bgMagenta.white.bold,
                chalk.bgYellow.white.bold,
                chalk.bgRed.white.bold
            ],
            hr:         chalk.yellow,
            listbullet: chalk.gray,
            listitem:   chalk.black,
            p:          chalk.black,
            table:      chalk.gray,
            tablerow:   chalk.gray,
            tablecell:  chalk.gray,

            // Inline
            strong:   chalk.red.bold,
            em:       chalk.yellow.italic,
            codespan: chalk.inverse.dim.bold,
            del:      chalk.bgWhite.gray.strikethrough,
            link:     chalk.underline,
            image:    chalk.bgYellow.black.underline,
        }
    } else {
        style = {
            // Block
            code:       chalk.white,
            blockquote: chalk.gray,
            html:       chalk.bgRed.gray,
            headings: [
                chalk.bgBlue.white.bold,
                chalk.bgGreen.white.bold,
                chalk.bgCyan.white.bold,
                chalk.bgMagenta.white.bold,
                chalk.bgYellow.white.bold,
                chalk.bgRed.white.bold,
            ],
            hr:         chalk.white,
            listbullet: chalk.gray,
            listitem:   chalk.white,
            p:          chalk.white,
            table:      chalk.gray,
            tablerow:   chalk.gray,
            tablecell:  chalk.gray,

            // Inline
            strong:   chalk.red.bold,
            em:       chalk.green.italic,
            codespan: chalk.inverse.dim.bold,
            del:      chalk.bgBlack.gray.strikethrough,
            link:     chalk.underline,
            image:    chalk.bgGreen.black.underline,
        }
    }

    if (options.github) {
        if (options.github === true) {
            console.log('Github flag requires a repo as an argument, e.g. ' + style.codespan(' mdr -g mrchimp/mdr '));
            process.exit();
        }

        var url = 'https://github.com/' + options.github + '/raw/' + options.branch +  '/' + options.file;
        
        readRemoteFile(url);
    } else if (options.bitbucket) {
        if (options.bitbucket === true) {
            console.log('Bitbucket flag requires a repo as an argument, e.g. ' + style.codespan(' mdr -b mrchimp/mdr '));
            process.exit();
        }

        var url = 'https://bitbucket.org/' + options.bitbucket + '/raw/' + options.branch +  '/' + options.file;
        
        readRemoteFile(url);
    } else {
        fs.stat(options.file, function (err, stat) {
            if (!err) {
                readLocalFile(options.file);
            } else {
                if (options.file == 'README.md') {
                    console.log('Couldn\'t find file.');
                    process.exit();
                } else {
                    readRemoteFile(options.file);
                }
            }
        });
    }    
}

/**
 * Repeat a string
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
        if (x == 1 ) {
            output += repeat(gutter_str, gutter_size - 2 ) + '" '
        } else {
            output += repeat(gutter_str, gutter_size)
        }
        output += split[x] + repeat(gutter_str, gutter_size) + '\n';
    }

    return output;
}

/**
 * Take a string and return formatted result
 * @param  {String} data Markdown string
 * @return {String}      Formatted result
 */
function render(data) {
    return marked(data, {
        renderer: rend,
        smartLists: true,
        gfm: true
    });
}

/**
 * Read and render a file from the web
 * @param  {String} url Location of file
 * @return {Undefined}     
 */
function readRemoteFile(url) {
    if (url.substring(0,4) != 'http') {
        url = 'http://' + url;
    }

    console.log('Getting remote file: ' + url);

    request.get(url, function (error, response, body) {

        if (error || response.statusCode !== 200) {
            console.log('Couldn\'t read remote file. Error code ' + response.statusCode + '.');
        } else {
            output(render(body));
        }
    });
}

/**
 * Read and render a local file
 * @param  {String} filename Path to file
 * @return {Undefined}
 */
function readLocalFile(filename) {
    var that = this;
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
            console.log('Couldn\'t open file: ' + err);
            process.exit();
        }

        output(render(data));
    });
}

/**
 * Output a string to the console, paging if necessary
 * @param {String} Text to output
 */
function output(content) {
    // If there's enough room on the screen, output it to the screen
    var line_count = content.split(/\r\n|\r|\n/).length;
    if (line_count <= process.stdout.rows) {
        console.log(content);
        return;
    }

    // Otherwise use Moar to page output
    var moar = require('moar')();
    moar.write(content);
    moar.end();
    moar.on('done', function () {
      process.exit(0);
    });
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
    var full_text = '',
        output = '',
        color_level = Math.min(level, 6); // We have limited colors

    if (this.settings.simple_headings) {
        full_text += indent;
    } else {
        full_text += repeat('#', level) + ' ';
    }

    full_text += text + repeat(' ', window_width - full_text.length - text.length);
    
    output = style.p('\n\n');
    output += style.headings[color_level - 1](full_text);
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
    var output = ' ';

    if (title) {
        output += title;
    } else {
        output += 'IMAGE';
    }

    if (text) {
        output += ' - ' + text;
    }

    output += ' - ' + href + ' ';
    return style.image(output);
};

module.exports = {
    version: pkg.version,
    run: run
};
