var fs = require('fs');
var path = require('path');
var aug = require('aug');
var str = require('str.js');
var slug = require('slug');
var uglifyJs = require('uglify-js');
var Class = require('simple-class').Class;

var AssetBlock = Class.extend({
  init: function(key, options) {
    if (!key) throw new Error('key is required');
    var defaults = {
      compress: false,
      compressedPath: ''
    };
    this.key = key;
    this.extension = null;
    this.options = aug({}, defaults, options);
    //this.options.basePath = path.join(cwd, this.options.basePath);
    //this.options.compressPath = path.join(this.options.basePath, this.options.compressPath);
    this.files = [];
  },
  compress: function(enabled) {
    this.options.compress = enabled;
    return this;
  },
  compressedPath: function(path) {
    this.options.compressedPath = path;
    return this;
  },
  push: function(file) {
    var ext = path.extname(file);
    if (!this.extension)
      this.extension = ext;
    else if (this.extension != ext)
      throw new Error('all files must be '+this.extension);
    
    if (!path.existsSync(file)) throw new Error(file + ' doesn\'t exist');
    if (this.files.indexOf(file) == -1)
      this.files.push(file);
    return this;
  },

  getLastModified: function() {
    var self = this;
    var mostRecent = 0;
    this.files.forEach(function(file, index) {
      //TODO:refactor to use parallel
      var stat = fs.statSync(path.join(self.options.basePath, file));
      var mtime = new Date(stat.mtime).getTime();
      if (mtime > mostRecent)
        mostRecent = mtime;
    });
    return mostRecent;
  },
  getCompressedFileName: function() {
    var lastModified = this.getLastModified();
    var fileName = str.format("{0}-{1}{2}", [slug(this.key), lastModified, this.extension]); //TODO: slug key
    var compressedFile = path.join(this.options.compressedPath, fileName);
    return compressedFile;
  },
  concatFiles: function() {
    //TODO:parallel
    var self = this;
    var concat = [];
    this.files.forEach(function(file, index) {
      var js = fs.readFileSync(path.join(self.options.basePath, file), 'utf8');
      concat.push(js);
    });
    return concat.join('');
  },
  process: function(callback) {
    var self = this;

    if (this.options.compress && this.compressFiles) {
      //TODO: refactor
      var serveCompressed = function(compressedFile) {
        callback.call(self, [compressedFile]);
      };
      var compressedFile = this.getCompressedFileName(); 
      if (!path.existsSync(compressedFile)) {
        var concat = this.concatFiles();
        this.compressFiles(concat, function(results) {
          fs.writeFile(compressedFile, results, function(err) {
            if (err) throw err;
            serveCompressed(compressedFile);
          });
        });
      } else {
        serveCompressed(compressedFile);
      }
    } else {
      callback.call(this, this.files);
    }
    return this;
  },
  compressFiles: function(cat, callback) {
    if (this.extension == '.js') {
      var ast = uglifyJs.parser.parse(cat);
      ast = uglifyJs.uglify.ast_mangle(ast);
      ast = uglifyJs.uglify.ast_squeeze(ast);
      cat = uglifyJs.uglify.gen_code(ast);
    }
    if (callback) callback(cat);
  }
});


module.exports = AssetBlock;
