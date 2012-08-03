#!/usr/bin/env node
var aug = require('aug');
var masher = require('../');
var config = require('../lib/config');
var defaults = require('../lib/defaults');
var fs = require('fs');
var findImports = require('../lib/utils/find-imports');

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
    describe: 'List of files to mash [file.js,file.js,file.js]',
    type: 'string'
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
  .options('w', {
    alias: 'watch',
    describe: 'Watch files for changes',
    default: false,
    type: 'boolean'
  })
  .options('h', {
    alias: 'help',
    descripe: 'Show help info'
  })

var argv = opt.argv

if (argv.help) {
  return opt.showHelp();
}

//watch functionality
var watch = function(arrObj) {
 
  var timeout;

  var watchFile = function(obj, file) {
    fs.watch(file, function() {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(function() {
        console.log('---');
        console.log('File Changed: '+file);
        console.log('');
        mash([obj]);

        //re-watch
        setTimeout(function() {
          watchFile(obj, file);
        }, 100);
      }, 700);
    });
  }

  var watchObj = function(obj) {
    obj.files.forEach(function(item) {
      console.log('Watching '+item);
      watchFile(obj, item);
      findImports(item, function(err, imports) {
        imports.forEach(function(file) {
          console.log('Watching '+file);
          watchFile(obj, file);
        });
      });
    });
  }
  arrObj.forEach(watchObj);

  argv.watch = false;

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
  if (argv.watch) {
    watch(obj);
  }
}
if (argv.files) {
  argv.files = argv.files.split(',');
}

if (argv._.length != 0) {
  config(argv._[0], argv, function(err, arrObj) {
    mash(arrObj);
  });
} else {
  var obj = aug(true, {}, defaults, argv);
  mash([obj]);
}

