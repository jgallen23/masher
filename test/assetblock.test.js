var exec = require('child_process').exec;
var fs = require('fs');
var should = require('should');
var path = require('path');
var AssetBlock = require('../lib/assetblock');

var assetPath = path.join(__dirname, '../example/public');
var compressedPath = path.join(__dirname, '../example/public/compressed');
var scriptFile = path.join(assetPath, '/scripts/app.js');
var styleFile = path.join(assetPath, '/stylesheets/app.css');

describe('AssetBlock', function() {

  before(function(start) {
    fs.writeFile(scriptFile, 'console.log("app.js loaded");\nvar a=1;\n', function(err) {
      start();
    });
  });

  it('should require a key', function() {
    (function() {
      new AssetBlock();
    }).should.throw();
  });
  it('should check for valid files', function() {
    (function() {
      new AssetBlock('key')
        .push('test.js');
    }).should.throw();
  });

  it('should set options', function() {
    var block = new AssetBlock('key', {
      compress: true
    });
    block.options.compress.should.be.true;
  });

  it('should set compress to true', function() {
    new AssetBlock('key').compress(true).options.compress.should.be.true;
  });

  it('should add a file to the files array', function() {
    new AssetBlock('key').push(scriptFile).files.length.should.equal(1);
  });

  it('should determine type automatically', function() {
    new AssetBlock('key').push(scriptFile).extension.should.equal('.js');
  });

  it('should not allow two different types to be added', function() {
    (function() {
      new AssetBlock('key')
        .push(scriptFile)
        .push(styleFile);
    }).should.throw();
  });

  it('should not allow two of the same file', function() {
      new AssetBlock('key')
        .push(scriptFile)
        .push(scriptFile)
        .files.length.should.equal(1);
  });

  it('should not error if no files added', function(done) {
    (function() {
      new AssetBlock('key')
        .process(function() {
          done();
        })
    }).should.not.throw();
  });


  it('should output file array when compress is false', function(done) {
    new AssetBlock('key')
      .compress(false)
      .push(scriptFile)
      .process(function(result) {
        result.should.not.be.empty;
        result.length.should.equal(1);
        result.should.include(scriptFile);
        done();
      });
  });
  it('should compress', function(done) {
    new AssetBlock('key')
      .compress(true)
      .compressedPath(compressedPath)
      .push(scriptFile)
      .process(function(result) {
        result.should.not.be.empty;
        result.should.be.an.instanceof(Array);
        result.length.should.equal(1);
        result.should.not.include(scriptFile);
        path.existsSync(result[0]).should.be.true;
        fs.readFile(result[0], 'utf8', function(err, results) {
          results.should.equal('console.log("app.js loaded");var a=1');
          done();
        });
      });
  });
  it('should be the same output if nothing is changed', function(done) {
    var compressedFile;
    new AssetBlock('key')
      .compress(true)
      .compressedPath(compressedPath)
      .push(scriptFile)
      .process(function(result) {
        compressedFile = result[0];
        this.process(function(result) {
          result[0].should.equal(compressedFile);
          done();
        });
      });
  });
  /*
  it('should regenerate file if something has changed', function(done) {
    var compressedFile;
    new AssetBlock('key')
      .compress(true)
      .compressedPath(compressedPath)
      .push(scriptFile)
      .process(function(result) {
        compressedFile = result;
        var self = this;
        setTimeout(function() { //delay 1 sec before modifing
          exec('echo "var a = 1;" >> '+scriptFile, function() {
            self.process(function(result) {
              result.should.not.equal(compressedFile);
              done();
            });
          });
        }, 1000);
      });
  });
  */
  it('should not fail', function(done) {
    new AssetBlock('key')
      .process(function(result) {
        result.length.should.equal(0);
        done();
      });
  });
});
