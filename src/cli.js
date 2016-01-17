#!/usr/bin/env node
import minimist from 'minimist';
import instrument from './index';

const argv = minimist(process.argv.slice(2));

if (argv._ && argv._.length) {
    instrument(argv._);
} else {
    console.log('Usage: casper-summoner file.js [file2.js..]\nDoes not support globs!'); // eslint-disable-line
}
