var lg = require('logr')();
lg._removeAdaptors();
var should = require('should');
var path = require('path');

var Masher = require('../lib/masher');

var assetPath = path.join(__dirname, '../example/public');
var compressedPath = path.join(__dirname, '../example/public/compressed');
var relativeScriptFile = '/scripts/app.js'; 
var relativeStyleFile = '/stylesheets/app.css';
var scriptFile = path.join(assetPath, relativeScriptFile);
var styleFile = path.join(assetPath, relativeStyleFile);

describe('Masher', function() {
  it('should require a url', function() {
    (function() {
      new Masher();
    }).should.throw();
  });

  it('should return placeholder', function() {
    var m = new Masher('/');
    m.scripts().should.equal(m.scriptPlaceholder);
    m.styles().should.equal(m.stylePlaceholder);
  });
  it('should find relative files', function(done) {
    new Masher('/')
      .setAssetPath(assetPath)
      .findFile(relativeScriptFile, 'js', function(err, fullFile) {
        fullFile.should.equal(scriptFile);
        done();
      });
  });
  /*
  it('should find files with or without extension', function(done) {
    new Masher('/')
      .assetPath(assetPath)
      .findFile('/script/app', 'js', function(err, fullFile) {
        fullFile.should.equal(scriptFile);
      });
  });
  */
  it('should add relative assets and default to using url as key', function() {
    var url = 'test';
    new Masher(url)
      .setAssetPath(assetPath)
      .addScript(relativeScriptFile)
      .assets.scripts[url].files.length.should.equal(1);
  });
  it('should allow multiple files to be added at once');
  it('should take a custom key when adding', function() {
    var url = 'test';
    var key = 'key';
    new Masher(url)
      .setAssetPath(assetPath)
      .addScript(key, relativeScriptFile)
      .assets.scripts[key].files.length.should.equal(1);

  });
  describe('scripts', function() {
    it('should output script tags', function(done) {
      var m = new Masher('/');
      var template = m.scriptPlaceholder+m.stylePlaceholder;
      
      m.setAssetPath(assetPath)
        .addScript(relativeScriptFile)
        .replacePlaceholders(template, function(str) {
          str.should.be.a('string');
          str.should.include('<script');
          str.should.not.include(scriptFile);
          str.should.include(relativeScriptFile);
          done();  
        });
    }); 
    it('should output compressed scripts', function(done) {
      var m = new Masher('/');
      var template = m.scriptPlaceholder+m.stylePlaceholder;
      m.setAssetPath(assetPath)
        .compress(true)
        .setCompressedPath(compressedPath)
        .addScript(relativeScriptFile)
        .replacePlaceholders(template, function(str) {
          str.should.be.a('string');
          str.should.include('<script');
          str.should.not.include(relativeScriptFile);
          done();  
        });
    }); 
  });
  describe('styles', function() {
    it('should output style tags', function(done) {
      var m = new Masher('/');
      var template = m.scriptPlaceholder+m.stylePlaceholder;
      
      m.setAssetPath(assetPath)
        .addStyle(relativeStyleFile)
        .replacePlaceholders(template, function(str) {
          str.should.be.a('string');
          str.should.include('<link');
          str.should.not.include(styleFile);
          str.should.include(relativeStyleFile);
          done();  
        });
    }); 
    it('should output compressed styles', function(done) {
      var m = new Masher('/');
      var template = m.scriptPlaceholder+m.stylePlaceholder;
      m.setAssetPath(assetPath)
        .compress(true)
        .setCompressedPath(compressedPath)
        .addStyle(relativeStyleFile)
        .replacePlaceholders(template, function(str) {
          str.should.be.a('string');
          str.should.include('<link');
          str.should.not.include(relativeStyleFile);
          done();  
        });
    }); 
  });
  describe('mixed', function() {
    it('should output both tags', function(done) {
      var m = new Masher('/');
      var template = m.scriptPlaceholder+m.stylePlaceholder;
      
      m.setAssetPath(assetPath)
        .addScript(relativeScriptFile)
        .addStyle(relativeStyleFile)
        .replacePlaceholders(template, function(str) {
          str.should.be.a('string');
          str.should.include('<script');
          str.should.not.include(scriptFile);
          str.should.include(relativeScriptFile);
          str.should.include('<link');
          str.should.not.include(styleFile);
          str.should.include(relativeStyleFile);
          done();  
        });
    }); 
    it('should output compressed styles', function(done) {
      var m = new Masher('/');
      var template = m.scriptPlaceholder+m.stylePlaceholder;
      m.setAssetPath(assetPath)
        .compress(true)
        .setCompressedPath(compressedPath)
        .addScript(relativeScriptFile)
        .addStyle(relativeStyleFile)
        .replacePlaceholders(template, function(str) {
          str.should.be.a('string');
          str.should.include('<link');
          str.should.include('<script');
          str.should.not.include(relativeScriptFile);
          str.should.not.include(relativeStyleFile);
          done();  
        });
    }); 
  });
  describe('multiple keys', function() {
    it('should output multiple script/style files when multiple keys are defined', function(done) {
      var m = new Masher('/');
      var key = 'testkey';
      var template = m.scriptPlaceholder+m.stylePlaceholder;
      m.setAssetPath(assetPath)
        .compress(true)
        .setCompressedPath(compressedPath)
        .addScript(relativeScriptFile)
        .addScript(key, relativeScriptFile)
        .addStyle(relativeStyleFile)
        .addStyle(key, relativeStyleFile)
        .replacePlaceholders(template, function(str) {
          str.should.be.a('string');
          str.should.include('<link');
          str.should.include('<script');
          str.should.include(key);
          str.should.not.include(relativeScriptFile);
          str.should.not.include(relativeStyleFile);
          done();  
        });
    });
    it('should preserve ordering');
  });
});

