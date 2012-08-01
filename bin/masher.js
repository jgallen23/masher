#!/usr/bin/env node
var aug = require('aug');
var masher = require('../');
var config = require('../lib/config');
var defaults = require('../lib/defaults');
var fs = require('fs');

var version = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version

var opt = require('optimist')
  .usage('Masher '+version+'\n$0 [opts] <config>')
  .options('n', {
    alias: 'name',
    describe: 'Name of file',
    default: defaults.name 
  })
  .options('f', {
    alias: 'files',
    describe: 'List of files to mash [file.js,file.js,file.js]'
  })
  .options('m', {
    alias: 'minify',
    describe: 'Minify/compress files',
    type: 'boolean',
    default: defaults.minify
  })
  .options('a', {
    alias: 'hash',
    describe: 'Append hash to filename',
    default: defaults.hash,
    type: 'boolean'
  })
  .options('v', {
    alias: 'version',
    describe: 'Append version to filename',
    default: defaults.version,
    type: 'string'
  })
  .options('o', {
    alias: 'out',
    describe: 'Output directory',
    default: process.cwd()
  })
  .options('h', {
    alias: 'help',
    descripe: 'Show help info'
  })

var argv = opt.argv

if (argv.help) {
  return opt.showHelp();
}


var mash = function(obj) {
  masher(obj, function(err) {
    if (err) {
      throw err;
    }
    console.log('Mashed:');
    for (var i = 1, c = this.length; i < c; i++) {
      var item = this[i];
      console.log(item.filename);
    }
  });
}


if (argv._.length != 0) {
  config(argv._[0], function(err, arrObj) {
    var newArr = [];

    arrObj.forEach(function(item) {
      newArr.push(aug(true, {}, defaults, item, argv));
    });

    mash(newArr);
  });
} else {
  var obj = aug(true, {}, defaults, argv);
  mash(obj);
}


