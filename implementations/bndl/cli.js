#!/usr/bin/env node

"use strict";

var fs = require('fs'),
    yargs = require('yargs'),
    bndl = require('./index'),
    glob = require('glob');

var argv = yargs.usage('Usage: makebndl [inputFile:type ...] -o outputFile [-q]')
    .example('makebndl model.obj:obj texture.jpg:img -o images.bndl')
    .example('makebndl "*.(png|jpg):img" -o images.bndl')
    .describe('o', 'Output file')
    .alias('o', 'out')
    .describe('q', 'Quiet mode. Silence the output.')
    .alias('q', 'quiet')
    .boolean(['quiet'])
    .demandOption(['o'])
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .argv;

var log = argv.quiet ? function noop() {} : function log(s) { console.log(s)},
    now = Date.now(),
    files = {};

log(' * Listing files');

argv._.forEach(function (file) {
    var colonPos = file.lastIndexOf(':'),
        type,
        pattern;

    if (colonPos !== -1) {
        type = file.slice(colonPos + 1);
        pattern = file.slice(0, colonPos);
    } else {
        throw new Error('BNDL cli: No type assigned to file: ' + file[0]);
    }

    glob.sync(pattern, {}).forEach(function (file) {
        var data = fs.readFileSync(file);
        files[file] = {
            data: data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
            type: type
        };
    });
});

log(' * Encoding');

var arrayBuffer = bndl.encode(files);

log(' * Writing ' + argv.out);

fs.writeFileSync(argv.out, new Uint8Array(arrayBuffer), { flag: 'w' });

log('');
log('Operation completed in ' + ((Date.now() - now) / 1000).toFixed(2) + 's.');
log('Number of files : ' + Object.keys(files).length);
log('Bundle file size : ' + (arrayBuffer.byteLength / 1024).toFixed(3) + 'kB');

log('');