var fs = require('fs');
var path = require('path');
var types = require('../map').types;
var res = require('resistance');

var process = {
  '.coffee': function(source, filename, cb) {

  },
  '.styl': function(source, filename, cb) {
    var stylus = require('../languages/stylus');
    stylus(source, filename, cb);
  }
}


module.exports = function(files, type, callback) {

  var queue = res.queue(function(file, next) {
    var ext = path.extname(file.filename);
    if (process[ext]) {
      process[ext](file.source, file.filename, function(err, source, filename) {
        file.source = source;
        next(file);
      });
    } else {
      next(file);
    }
  });
 
  queue.push(files);
  queue.run(function() {
    callback(null, this, type);
  });

};
