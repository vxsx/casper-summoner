#!/usr/bin/env node
require('babel-register');
var argv = require('minimist')(process.argv.slice(2));
var instrument = require('./index')['default'];

if (argv._ && argv._.length) {
    instrument(argv._);
} else {
    console.log('Usage: casper-summoner file.js [file2.js..]\nDoes not support globs!'); // eslint-disable-line
}
