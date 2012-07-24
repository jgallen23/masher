var aug = require('aug');
var path = require('path');
var fs = require('fs');
var res = require('resistance');

var concat = require('./plugins/concat');
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
    //concat files
    function(next) {
      concat(obj.files, next);
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
      var min = (obj.minify) ? '.min' : '';
      var version = (obj.version) ? '-' + obj.version : '';
      var hashStr = (obj.hash) ? '-' + hash(source) : '';

      var filename = path.join(out, obj.name + version + hashStr + min + map.ext[type]);

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

