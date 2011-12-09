var fs = require('fs');
var cwd = process.cwd();
var path = require('path');
var uglifyJs = require('uglify-js');
var aug = require('aug');
var str = require('str.js');
var render = require('./express');
var Class = require('simple-class').Class;

var scriptsPlaceholder = '<!-- @@@MASHER_SCRIPTS@@@ -->';
var stylesPlaceholder = '<!-- @@@MASHER_STYLES@@@ -->';

var MasherAsset = Class.extend({
  init: function(key, options) {
    var defaults = {
      basePath: '',
      compress: false,
      compressPath: 'compressed'
    };
    this.key = key;
    this.options = aug({}, defaults, options);
    this.options.basePath = path.join(cwd, this.options.basePath);
    this.options.compressPath = path.join(this.options.basePath, this.options.compressPath);
    this.files = [];
  },
  push: function(file) {
    if (this.files.indexOf(file) == -1)
      this.files.push(file);
  },
  getOutput: function() {
    if (this.options.compress && this._compress) {
      var compressedFile = this.compress();
      compressedFile = compressedFile.replace(this.options.basePath, '');
      return str.format(this.format, [compressedFile]);
    }
    var self = this;
    var html = [];
    this.files.forEach(function(item, i) {
      html.push(str.format(self.format, [item]));
    });
    return html.join('');
  },
  getLastModified: function() {
    var self = this;
    var mostRecent = 0;
    this.files.forEach(function(file, index) {
      var stat = fs.statSync(path.join(self.options.basePath, file));
      var mtime = new Date(stat.mtime).getTime();
      if (mtime > mostRecent)
        mostRecent = mtime;
    });
    return mostRecent;
  },
  getFileName: function() {
    var lastModified = this.getLastModified();
    var fileName = str.format("{0}.{1}", [lastModified, this.extension]); //TODO: slug key
    var compressedFile = path.join(this.options.compressPath, fileName);
    return compressedFile;
  },
  concatFiles: function() {
    var self = this;
    var concat = [];
    this.files.forEach(function(file, index) {
      var js = fs.readFileSync(path.join(self.options.basePath, file), 'utf8');
      concat.push(js);
    });
    return concat.join('');
  },
  compress: function() {
    var self = this;
    var compressedFile = this.getFileName(); 
    if (!path.existsSync(compressedFile)) {
      this._compress(compressedFile);
    }
    return compressedFile;
  }
});

var MasherStyle = MasherAsset.extend({
  format: "<link rel='stylesheet' href='{0}'/>",
  extension: "css"
});

var MasherScript = MasherAsset.extend({
  format: "<script src='{0}'></script>",
  extension: "js",
  _compress: function(compressedFile) {
    var concat = this.concatFiles();
    var ast = uglifyJs.parser.parse(concat);
    ast = uglifyJs.uglify.ast_mangle(ast);
    ast = uglifyJs.uglify.ast_squeeze(ast);
    var results = uglifyJs.uglify.gen_code(ast);
    fs.writeFileSync(compressedFile, results);
  }
});

var Masher = Class.extend({
  init: function(url, options) {
    //TODO: slug url
    this._scripts = new MasherScript(url, options);
    this._styles = new MasherStyle(url, options);
    this._commonScripts = new MasherScript('_common', options);
    this._commonStyles = new MasherStyle('_common', options);
  },
  addScript: function(file) {
    this.addAsset(this._scripts, file);
  },
  addStyle: function(file) {
    console.log("add style", file);
    this.addAsset(this._styles, file);
  },
  addCommonStyle: function(file) {
    this.addAsset(this._commonStyles, file);
  },
  addCommonScript: function(file) {
    this.addAsset(this._commonScripts, file);
  },
  addAsset: function(type, file) {
    if (typeof file === "string")
      file = [file];
    file.forEach(function(file, i) {
      type.push(file);
    });
  },
  scripts: function(force) {
    if (force)
      return this._commonScripts.getOutput() + this._scripts.getOutput();
    else
      return scriptsPlaceholder;
  },
  styles: function(force) {
    if (force)
      return this._commonStyles.getOutput() + this._styles.getOutput();
    else
      return stylesPlaceholder;
  },
  replacePlaceholder: function(str) {
    str = str.replace(stylesPlaceholder, this.styles(true));
    str = str.replace(scriptsPlaceholder, this.scripts(true));
    return str;
  }
});

var _cache = {};
module.exports = {
  helpExpress: function(app, options) {
    app.dynamicHelpers({
      masher: function(req, res) {
        if (!_cache[req.url]) {
          _cache[req.url] = new Masher(req.url, options);
        }
        return _cache[req.url];
      }
    });
  },
  Masher: Masher,
  MasherAsset: MasherAsset,
  MasherScript: MasherScript
};
