#!/usr/bin/env node

'use strict';

var marked = require('marked');
var TerminalRenderer = require('marked-terminal');
var chalk = require('chalk');
var fs = require('fs');
var pkg = require('../package.json');
var ent = require('ent');
var request = require('request');

var style,
    rend = TerminalRenderer,
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
    if (typeof callback !== 'function') {
        callback = function(){};
    }

    if (options.help) {
        console.log(yargs.showHelp());
        process.exit();
    }

    var marked_term_options = {};
    
    /*
     * Define Text Styles
     */
    if (options.invert) {

        marked_term_options.code = chalk.black;
        marked_term_options.blockquote = chalk.gray.italic;
        marked_term_options.html = chalk.bgRed.gray;
        marked_term_options.heading = chalk.magenta.dim.underline.bold;
        marked_term_options.firstHeading = chalk.magenta.underline.bold;
        marked_term_options.hr = chalk.yellow;
        marked_term_options.listitem = chalk.black;
        marked_term_options.table = chalk.gray;
        marked_term_options.paragraph = chalk.reset;
        marked_term_options.strong = chalk.bold;
        marked_term_options.em = chalk.italic;
        marked_term_options.codespan = chalk.inverse.dim.bold;
        marked_term_options.del = chalk.dim.gray.strikethrough;
        marked_term_options.link = chalk.underline.blue;
        marked_term_options.href = chalk.underline.blue;
    } else {
        marked_term_options.code = chalk.white;
        marked_term_options.blockquote = chalk.gray.italic;
        marked_term_options.html = chalk.bgRed.gray;
        marked_term_options.heading = chalk.magenta.dim.underline.bold;
        marked_term_options.firstHeading = chalk.magenta.underline.bold;
        marked_term_options.hr = chalk.white;
        marked_term_options.listitem = chalk.white;
        marked_term_options.table = chalk.gray;
        marked_term_options.paragraph = chalk.reset;
        marked_term_options.strong = chalk.bold;
        marked_term_options.em = chalk.italic;
        marked_term_options.codespan = chalk.white;
        marked_term_options.del = chalk.dim.gray.strikethrough;
        marked_term_options.link = chalk.blue;
        marked_term_options.href = chalk.blue.underline;
    }

    var marked_options = {
        smartLists: true,
        gfm: true,
        renderer: new TerminalRenderer(marked_term_options),
    };

    marked.setOptions(marked_options);

    if (options.github) {
        if (options.github === true) {
            console.log('Github flag requires a repo as an argument, e.g. ' + rend.settings.codespan(' mdr -g mrchimp/mdr '));
            process.exit();
        }

        var url = 'https://github.com/' + options.github + '/raw/' + options.branch +  '/' + options.file;
        
        readRemoteFile(url);
    } else if (options.bitbucket) {
        if (options.bitbucket === true) {
            console.log('Bitbucket flag requires a repo as an argument, e.g. ' + rend.settings.codespan(' mdr -b mrchimp/mdr '));
            process.exit();
        }

        var url = 'https://bitbucket.org/' + options.bitbucket + '/raw/' + options.branch +  '/' + options.file;
        
        readRemoteFile(url);
    } else if (options.npm) {
      if (options.npm === true) {
        console.log('NPM flag requries a repo as an argument, e.g. ' + rend.settings.codespan(' mdr -n somepackage'));
        process.exit();
      }

      getNPMFile(options.npm);
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
 * Get readme from an NPM package name.
 *
 * @param  {String} package Name of package
 */
function getNPMFile(package_name) {
  var npm = require('npm');
  var url = require('url');

  npm.load({}, function () {
    npm.commands.view(
      [package_name, 'readmeFilename', 'repository.url'],
      true,
      function (error, data) {
        var raw_url,
            file_name,
            readme_url;
        
        if (error) {
          console.log(error);
          return false;
        }

        var datum = getFirst(data);

        if (!datum) {
          console.log('Could not get readme URL.');
          return false;
        }

        raw_url = datum['repository.url'];
        file_name = datum['readmeFilename'];

        var repo_url = url.parse(raw_url);
        
        switch (repo_url.hostname) {
          case 'github.com':
            readme_url = raw_url.replace('github.com', 'raw.githubusercontent.com') + 
                         '/master/' + file_name;
            break;
          case 'bitbucket.org':
            readme_url = 'https://bitbucket.org/' + repo_url.pathname +
                         '/raw/master/' + file_name;
            break;
          default:
            console.log('I don\'t know how to find that readme file. Sorry. Please raise an issue at github.com/mrchimp/mdr');
            return false;
        }
        
        readRemoteFile(readme_url);
      }
    );
  });
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
    return marked(data);
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

/**
 * Get the first element from an object
 */
function getFirst(obj) {
  for (var i in obj) {
    if (obj.hasOwnProperty(i) && typeof i !== 'function') {
      return obj[i];
    }
  }
}

module.exports = {
    version: pkg.version,
    run: run
};
