var testCase = require('nodeunit').testCase;
var Masher = require('../').Masher;

module.exports = testCase({
  blankRequire: function(t) {
    var masher = new Masher();
    masher.require('header', 'common');
    t.done();
  },
  requireTest: function(t) {
    var masher = new Masher();
    masher.require('header', 'common', ['ui/scripts/common.js'], ['ui/stylesheets/common.css']);
    t.equal(masher._styles.header.common.files.length, 1);
    t.equal(masher._scripts.header.common.files.length, 1);
    t.done();
  },
  addingSameFileTwice: function(t) {
    var masher = new Masher();
    masher.require('header', 'common', ['ui/scripts/common.js']);
    masher.require('header', 'common', ['ui/scripts/common.js']);
    t.equal(masher._scripts.header.common.files.length, 1);
    t.done();
  },
  block: function(t) {
    var masher = new Masher();
    masher.require('header', 'common', ['ui/scripts/common.js'], ['ui/stylesheets/common.css']);
    var output = masher.block('header');
    t.ok(output);
    t.notEqual(output.indexOf('script'), -1);
    t.notEqual(output.indexOf('stylesheet'), -1);
    t.done();
  },
  compressJS: function(t) {
    var masher = new Masher({
      basePath: 'example/public', 
      compressPath: 'compressed',
      compress: true
    });
    masher.require('header', 'common', ['ui/scripts/external/ender.js', 'ui/scripts/app.js']);
    var output = masher.block('header');
    t.ok(masher._scripts.header.common.compressed);
    console.log(output);
    t.done();
  }
  //test: on restart, don't compress
  //test: on file change, re-compress
});
