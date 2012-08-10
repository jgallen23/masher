var aug = require('aug');
var path = require('path');
var fs = require('fs');
var res = require('resistance');

var read = require('./plugins/read');
var preprocessors = require('./plugins/preprocessors');
var minify = require('./plugins/minify'); 
var hash = require('./plugins/hash');
var map = require('./map');
var defaults = require('./defaults');

module.exports = function(obj, callback) {
  //override defaults
  obj = aug(true, {}, defaults, obj);

  //join base directory
  obj.files.map(function(file) {
    return path.join(obj.baseDir, file);
  });

  res.series([
    //read files
    function(next) {
      read(obj.files, next);
    },
    //preprocess
    function(next, files, type) {
      preprocessors(files, type, next);
    },
    //concat files
    function(next, files, type) {
      var source = [];
      files.forEach(function(file) {
        source.push(file.source);
      });
      next(null, source.join('\n'), type);
    },
    //minifiy
    function(next, source, type) {
      if (!obj.minify) {
        return next(null, source, type);
      }
      minify(source, type, next);
    },

    //TODO: gzip

    //filename (min, version, output)
    function(next, source, type) {
      var out = obj.out || '';
      var filename;
      if (obj.filename) {
        filename = path.join(out, obj.filename + map.ext[type]);
      } else {
        var min = (obj.minify) ? '.min' : '';
        var version = (obj.version) ? '-' + obj.version : '';
        var hashStr = (obj.hash) ? '-' + hash(source) : '';

        filename = path.join(out, obj.name + version + hashStr + min + map.ext[type]);
      }

      next(null, source, filename);
    },

    //write file
    function(next, source, filename) {
      if (obj.out) {
        fs.writeFile(filename, source, function(err) {
          next(err, source, filename);
        });
      } else {
        next(null, source, filename);
      }
    }
  ], function(err, source, filename) {
    if (callback) {
      callback(err, source, filename);
    }
  });
}

