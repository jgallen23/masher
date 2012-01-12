var fs = require('fs');
var path = require('path');
var aug = require('aug');
var str = require('str.js');
var R = require('resistance');
var Class = require('simple-class').Class;

var AssetBlock = require('./assetblock');

var Masher = Class.extend({
  scriptPlaceholder: '<!-- @@@MASHER_SCRIPTS@@@ -->',
  stylePlaceholder: '<!-- @@@MASHER_STYLES@@@ -->',
  scriptFormat: "<script src='{0}'></script>",
  styleFormat: "<link rel='stylesheet' href='{0}'/>",
  init: function(url, options) {
    if (!url) throw new Error('url is required');
    //if (!options.assetPath) throw new Error('asset path is required');
    //TODO: slug url
    this.url = url;
    this.options = aug({}, options);
    this.assets = {
      scripts: {},
      styles: {} 
    };
  },
  compress: function(enable) {
    this.options.compress = true;
    return this;
  },
  setAssetPath: function(path) {
    this.options.assetPath = path;
    return this;
  },
  setCompressedPath: function(path) {
    this.options.compressedPath = path;
    return this;
  },
  findFile: function(file, type, callback) {
    //should allow:
    //app
    //app.js
    var count = 0;
    var max = 2;
    var joinedFile = path.join(this.options.assetPath, file);
    while (count < max && !path.existsSync(joinedFile)) {

      count++;
    }
    callback((count==max), joinedFile);
    return this;
  },
  addScript: function(key, file) {
    this.addAsset('scripts', key, file);
    return this;
  },
  addStyle: function(key, file) {
    this.addAsset('styles', key, file);
    return this;
  },
  getAsset: function(key, type) {
    var asset = this.assets[type][key];
    if (!asset)
      asset = this.assets[type][key] = new AssetBlock(key, this.options);
    return asset;
  },
  addAsset: function(type, key, file) {
    if (!file) {
      file = key;
      key = this.url;
    }
    var self = this;
    //if (typeof file === "string")
      //file = [file];
    this.findFile(file, type, function(err, fullPath) {
      //file.forEach(function(file, i) {
      self.getAsset(key, type).push(fullPath);
      //});
    });
    return this;
  },
  //for use in templates
  scripts: function() {
    return this.scriptPlaceholder;
  },
  styles: function() {
    return this.stylePlaceholder;
  },
  //once template has processed
  getAssetTag: function(files, format) {
  },
  processFiles: function(callback) {
    var getAssets = function(obj) {
      var assets = [];
      for (var key in obj) {
        assets.push(obj[key]);
      }
      return assets;
    };
    var self = this;
    var scripts = getAssets(this.assets.scripts);
    var styles = getAssets(this.assets.styles);
    var assets = scripts.concat(styles);
    var q = new R.queue(function(asset, callback) {
      asset.process(function(files) {
        callback([asset, files]);
      });
    });
    q.push(assets);
    q.run(function(data) {
      var scripts = [];
      var styles = [];
      for (var i = 0, c = data.length; i < c; i++) {
        var item = data[i];
        if (item[0].extension == '.js')
          scripts = scripts.concat(item[1]);
        else
          styles = styles.concat(item[1]);
      }
      callback(scripts, styles);
    });
    return this;
  },
  replacePlaceholders: function(template, callback) {
    var self = this;

    var getHTML = function(files, format) {
      var tag = [];
      for (var i = 0, c = files.length; i < c; i++) {
        var file = files[i];
        file = file.replace(self.options.assetPath, '');
        tag.push(str.format(format, [file]));
      }
      return tag.join('');
    };

    this.processFiles(function(scripts, styles) {
      var scriptHTML = getHTML(scripts, self.scriptFormat); 
      var styleHTML = getHTML(styles, self.styleFormat);

      template = template.replace(self.scriptPlaceholder, scriptHTML);
      template = template.replace(self.stylePlaceholder, styleHTML);
      callback(template);
    });
    /*
    R.parallel([
      function(cb) { self.commonScriptBlock.process(cb); },
      function(cb) { self.commonStyleBlock.process(cb); },
      function(cb) { self.scriptBlock.process(cb); },
      function(cb) { self.styleBlock.process(cb); }
    ], function(data) {
      var commonScriptTag = self.getAssetTag(data[0], self.commonScriptBlock.format);
      var scriptTag = self.getAssetTag(data[2], self.scriptBlock.format);
      var commonStyleTag = self.getAssetTag(data[1], self.commonStyleBlock.format);
      var styleTag = self.getAssetTag(data[3], self.styleBlock.format);
      str = str.replace(self.scriptPlaceholder, commonScriptTag+scriptTag);
      str = str.replace(self.stylePlaceholder, commonStyleTag+styleTag);
      callback(str);
    });
    */
  }
});

module.exports = Masher;
