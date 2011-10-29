var fs = require('fs');
var cwd = process.cwd();
var path = require('path');
var uglifyJs = require('uglify-js');
var aug = require('aug');

var Masher = function(options) {
  var defaults = {
    basePath: '',
    compress: false,
    compressPath: 'compressed'
  };
  this.options = aug({}, defaults, options);
  this.options.basePath = path.join(cwd, this.options.basePath);
  this.options.compressPath = path.join(this.options.basePath, this.options.compressPath);
  this._styles = {};
  this._scripts = {};
  //this._scripts['header']['common'] = { files: ['jquery.js', 'app.js'], compressed: 'common_asd.js' }
  this._formatRegEx = /\{([^}]+)\}/g;
  if (this.options.compress)
    this._createCompressedDir();
};

Masher.prototype.format = function(s, args) {
  return s.replace(this._formatRegEx, function(_, match){ return args[match]; }); 
};

Masher.prototype._renderBlockDebug = function(type, format, location) {
  if (!type[location])
    return '';
  var o = [];
  for (var group in type[location]) {
    for (var i = 0, c = type[location][group].files.length; i < c; i++) {
      var file = type[location][group].files[i];
      o.push(this.format(format, [file]));
    }
  }
  return o.join('');
};

Masher.prototype._createCompressedDir = function() {
  if (!path.existsSync(this.options.compressPath))
    fs.mkdirSync(this.options.compressPath, 0775);
};

Masher.prototype._each = function(obj, f) {
  for (var i = 0, c = obj.length; i < c; i++) {
    var item = obj[i];
    f(item, i);
  }
};

Masher.prototype._compressGroup = function(group, files) {
  var format = "{0}_{1}.js";
  var self = this;
  var mostRecent = 0;
  files.forEach(function(file, index) {
    var stat = fs.statSync(path.join(self.options.basePath, file));
    var mtime = new Date(stat.mtime).getTime();
    if (mtime > mostRecent)
      mostRecent = mtime;
  });
  var compressedFile = path.join(this.options.compressPath, this.format(format, [group, mostRecent]));
  if (path.existsSync(compressedFile)) {
    return compressedFile; 
  } else {
    var concat = [];
    files.forEach(function(file, index) {
      var js = fs.readFileSync(path.join(self.options.basePath, file), 'utf8');
      concat.push(js);
    });
    var ast = uglifyJs.parser.parse(concat.join(''));
    ast = uglifyJs.uglify.ast_mangle(ast);
    ast = uglifyJs.uglify.ast_squeeze(ast);
    var results = uglifyJs.uglify.gen_code(ast);
    fs.writeFileSync(compressedFile, results);
    return compressedFile;
  }
    //check if file already exists on disk - get latest modified file
    //concat all files in group
    //if scripts uglify
    //get hash
    //save file add latest modified date to end
    //store in compressed
    //return compressed file
};

Masher.prototype._renderBlockCompress = function(type, format, location) {
  if (!type[location])
    return '';
  var o = [];

  for (var group in type[location]) {
    if (type[location][group].files.length === 0) {
      continue;
    } else if (!type[location][group].compressed) {
      var file = this._compressGroup(group, type[location][group].files);
      type[location][group].compressed = file.replace(this.options.basePath, '');
    }
    o.push(this.format(format, [type[location][group].compressed]));
  }
  return o.join('');
};

Masher.prototype._renderBlock = function(type, format, location) {
  if (!this.options.compress) {
    return this._renderBlockDebug(type, format, location);
  } else {
    return this._renderBlockCompress(type, format, location);
  }
};

Masher.prototype._renderStyleBlock = function(location) {
  var format = "<link rel='stylesheet' href='{0}'/>";
  return this._renderBlock(this._styles, format, location);
};
Masher.prototype._renderScriptBlock = function(location) {
  var format = "<script src='{0}'></script>";
  return this._renderBlock(this._scripts, format, location);
};

Masher.prototype.block = function(location) {
  var styles = this._renderStyleBlock(location);
  var scripts = this._renderScriptBlock(location);
  return styles+scripts;
};

Masher.prototype.require = function(location, group, scripts, styles) {
  this.requireScripts(location, group, scripts);
  this.requireStyles(location, group, styles);
};

Masher.prototype._requireAssets = function(type, location, group, files) {
  if (!type[location])
    type[location] = {};

  if (!type[location][group])
    type[location][group] = { files: [], compressed: '' };

  if (files) {
    for (var i = 0, c = files.length; i < c; i++) {
      var file = files[i];
      if (type[location][group].files.indexOf(file) == -1)
        type[location][group].files.push(file);
    }
  }
};

Masher.prototype.requireStyles = function(location, group, files) {
  this._requireAssets(this._styles, location, group, files);
};


Masher.prototype.requireScripts = function(location, group, files) {
  this._requireAssets(this._scripts, location, group, files);
};

var _cache = {};
module.exports = {
  helpExpress: function(app, options) {
    app.dynamicHelpers({
      masher: function(req, res) {
        if (!_cache[req.url])
          _cache[req.url] = new Masher(options);
        return _cache[req.url];
      }
    });
  },
  Masher: Masher
};
