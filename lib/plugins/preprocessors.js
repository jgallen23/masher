var fs = require('fs');
var path = require('path');
var types = require('../map').types;

var process = {
  '.coffee': function(source, filename, cb) {

  },
  '.styl': function(source, filename, cb) {
    var stylus = require('../languages/stylus');
    stylus(source, filename, cb);
  }
}



module.exports = function(filename, callback) {
  var ext = path.extname(filename);

  var type = types[ext];
  if (!type) {
    throw new Error(ext + ' is an unknown type');
  }

  var fileRead = function(err, source) {
    if (err) throw err;

    if (process[ext]) {
      process[ext](source, filename, function(err, source, filename) {
        callback(null, source, type);
      });
    } else {
      callback(null, source, type);
    }
  }


  fs.readFile(filename, 'utf8', fileRead);

};
