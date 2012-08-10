var assert = require('assert');
var masher = require('../');
var fs = require('fs');
var path = require('path');
var existsSync = fs.existSync || path.existsSync;

var fixturePath = __dirname + '/fixtures/';

var readFixture = function(name, ext) {
  ext = ext || '.js';
  return fs.readFileSync(fixturePath + name+ext, 'utf8');
}


/*
masher({
     name: 'app',
     baseDir: __dirname + '/public/ui/scripts'
     files: ['a.js', 'b.js', 'c.coffee']
     minify: true,
     gzip: true,
     hash: true,
     version: 'v1.2',
     out: __dirname + '/public/_compressed'
}, function(err, results) {
})
*/

suite('Masher', function() {

  var scriptFiles = [
    fixturePath + 'a.js',
    fixturePath + 'b.js'
  ];

  var styleFiles = [
    fixturePath + 'stylea.css',
    fixturePath + 'styleb.css'
  ];

  suite('init', function() {
    test('must pass in files');
    test('pass in array', function(done) {

      masher([{ 
        files: scriptFiles 
      }, {
        files: styleFiles
      }], function(err, scriptResult, styleResult) {
        //this gets set as array of results, with first being err
        assert.equal(this.length, 3);

        assert.ok(!err);
        assert.equal(scriptResult.source, readFixture('ab'));
        assert.equal(scriptResult.filename, 'mashed.js');

        assert.equal(styleResult.source, readFixture('styleab', '.css'));
        assert.equal(styleResult.filename, 'mashed.css');

        done();
      })

    });
    test('pass in string', function(done) {
      masher(fixturePath + 'config.yaml', function(err, results) {
        assert.equal(results.source, readFixture('ab'));
        assert.equal(results.filename, 'mashed.js');
        done();
      });
    });
  });

  suite('concat', function() {
    test('combining two scripts', function(done) {
      masher({ 
        files: scriptFiles 
      }, function(err, results) {
        assert.equal(results.source, readFixture('ab'));
        //default filename is mashed.[js|css]
        assert.equal(results.filename, 'mashed.js');
        done();
      })
    });

    test('combining two styles', function(done) {
      masher({ 
        files: styleFiles 
      }, function(err, results) {
        assert.equal(results.source, readFixture('styleab', '.css'));
        //default filename is mashed.[js|css]
        assert.equal(results.filename, 'mashed.css');
        done();
      })
    });

    test('should throw error if mix types');
  });

  suite('minify', function() {
    test('minify scripts', function(done) {
      masher({ 
        files: scriptFiles,
        minify: true
      }, function(err, results) {
        assert.equal(results.source+'\n', readFixture('ab.min'));
        done();
      })
    });

    test('minify styles', function(done) {
      masher({ 
        files: styleFiles,
        minify: true
      }, function(err, results) {
        assert.equal(results.source+'\n', readFixture('styleab.min', '.css'));
        done();
      })
    });

    //TODO: fix this
    test('minify bad code', function(done) {
      masher({ 
        files: [fixturePath + 'bad-code.js'],
        minify: true
      }, function(err, results) {
        assert.ok(err);
        done();
      })
      
    });
  });

  suite('filename', function() {
    test('set name, get back filename', function(done) {
      masher({ 
        name: 'app',
        files: scriptFiles,
      }, function(err, results) {
        assert.equal(results.filename, 'app.js');
        done();
      })
    });

    test('if minify, .min added to filename', function(done) {
      masher({ 
        name: 'app',
        minify: true,
        files: scriptFiles,
      }, function(err, results) {
        assert.equal(results.filename, 'app.min.js');
        done();
      })
    });

    test('if version set, append to filename', function(done) {
      masher({ 
        name: 'app',
        version: '1.2',
        files: scriptFiles,
      }, function(err, results) {
        assert.equal(results.filename, 'app-1.2.js');
        done();
      })
    });

    test('version + min', function(done) {
      masher({ 
        name: 'app',
        minify: true,
        version: '1.2',
        files: scriptFiles,
      }, function(err, results) {
        assert.equal(results.filename, 'app-1.2.min.js');
        done();
      })
    });

    test('hash', function(done) {
      masher({
        name: 'app',
        hash: true,
        files: scriptFiles,
      }, function(err, results) {
        assert.equal(results.filename, 'app-174a0b46.js');
        done();
      });
    });

    test('hash + min', function(done) {
      masher({
        name: 'app',
        hash: true,
        minify: true,
        files: scriptFiles,
      }, function(err, results) {
        assert.equal(results.filename, 'app-84e27e42.min.js');
        done();
      });
    });
  });

  suite('out', function() {
    test('set out, file is written', function(done) {

      masher({ 
        name: 'app',
        files: scriptFiles,
        out: '/tmp'
      }, function(err, results) {

        var expectedFilename = '/tmp/app.js';
        assert.equal(results.filename, expectedFilename);
        assert.equal(existsSync(expectedFilename), true);
        fs.unlinkSync(expectedFilename);
        done();
      })
    });
  });

  suite('preprocessors', function() {

    test('stylus', function(done) {

      masher({ 
        files: [
          fixturePath + 'stylec.styl',
          fixturePath + 'styleb.css',
        ],
      }, function(err, results) {

        assert.equal(results.source, readFixture('stylecb', '.css'));
        done();

      })
    });

  });

});
