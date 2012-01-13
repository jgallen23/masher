var lg = require('logr')('masher-assetblock');
var fs = require('fs');
var path = require('path');
var aug = require('aug');
var str = require('str.js');
var slug = require('./util/slug');
var uglifyJs = require('uglify-js');
var uglifycss = require('uglifycss');
var R = require('resistance');
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

  getLastModified: function(callback) {
    var self = this;
    var mostRecent = 0;
    var q = R.queue(function(file, callback) {
      var full = path.join(self.options.basePath, file);
      fs.stat(full, function(err, stat) {
        var mtime = new Date(stat.mtime).getTime();
        callback(mtime);
      });
    });
    q.push(this.files);
    q.run(function(results) {
      results.forEach(function(time, index) {
        if (time > mostRecent)
          mostRecent = time;
      });
      callback(mostRecent);
    });
    return this;
  },
  getCompressedFileName: function(callback) {
    var self = this;
    this.getLastModified(function(lastModified) {
      var fileName = str.format("{0}-{1}{2}", [slug(self.key), lastModified, self.extension]); //TODO: slug key
      var compressedFile = path.join(self.options.compressedPath, fileName);
      callback(compressedFile);
    });
    return this;
  },
  concatFiles: function() {
    //TODO:parallel
    var self = this;
    var concat = [];
    this.files.forEach(function(file, index) {
      lg.info('reading file', { file: file });
      var f = fs.readFileSync(path.join(self.options.basePath, file), 'utf8');
      concat.push(f);
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
      this.getCompressedFileName(function(compressedFile) {
        if (!path.existsSync(compressedFile)) {
          lg.info('compressing', { file: compressedFile, files: self.files });
          var concat = self.concatFiles();
          self.compressFiles(concat, function(results) {
            fs.writeFile(compressedFile, results, function(err) {
              if (err) throw err;
              serveCompressed(compressedFile);
            });
          });
        } else {
          serveCompressed(compressedFile);
        }
      }); 
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
    } else if (this.extension == '.css') {
      cat = uglifycss.processString(cat);
    }
    if (callback) callback(cat);
  }
});


module.exports = AssetBlock;
