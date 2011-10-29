var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
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
      compress: true
    });
    masher.require('header', 'common', ['ui/scripts/external/ender.js', 'ui/scripts/app.js']);
    var output = masher.block('header');
    t.ok(masher._scripts.header.common.compressed);
    t.done();
  },
  restartTest: function(t) {
    var opt = {
      basePath: 'example/public', 
      compress: true
    };
    var masher1 = new Masher(opt);
    masher1.require('header', 'common', ['ui/scripts/app.js']);
    masher1.block('header');
    var masher2 = new Masher(opt);
    masher2.require('header', 'common', ['ui/scripts/app.js']);
    masher2.block('header');
    t.ok(masher1._scripts.header.common.compressed);
    t.equal(masher1._scripts.header.common.compressed, masher2._scripts.header.common.compressed);
    var dir = path.join(path.join(__dirname, "../"), opt.basePath);
    var out1 = fs.readFileSync(dir+masher1._scripts.header.common.compressed, 'utf8');
    var out2 = fs.readFileSync(dir+masher2._scripts.header.common.compressed, 'utf8');
    t.equal(out1, out2);
    t.done();
  },
  fileChange: function(t) {
    var opt = {
      basePath: 'example/public', 
      compress: true
    };
    var masher1 = new Masher(opt);
    masher1.require('header', 'common', ['ui/scripts/app.js']);
    masher1.block('header');

    var dir = path.join(path.join(__dirname, "../"), opt.basePath);
    var file = path.join(dir, 'ui/scripts/app.js');
    exec('echo "var a = 1;" >> '+file, function() {

      var masher2 = new Masher(opt);
      masher2.require('header', 'common', ['ui/scripts/app.js']);
      masher2.block('header');
      t.ok(masher1._scripts.header.common.compressed);
      t.notEqual(masher1._scripts.header.common.compressed, masher2._scripts.header.common.compressed);

      var out1 = fs.readFileSync(dir+masher1._scripts.header.common.compressed, 'utf8');
      var out2 = fs.readFileSync(dir+masher2._scripts.header.common.compressed, 'utf8');
      t.notEqual(out1, out2);
      t.done();
    });
  }
});
