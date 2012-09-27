var fs = require('fs');
var path = require('path');
var res = require('resistance');
var glob = require('glob');

var exists = fs.exists || path.exists;

var files = function(arr, callback) {

  var list = [];
  var queue = res.queue(function(file, next) {

    glob(file, function(err, f) {
      list = list.concat(f)
      next();
    });


  }, true);

  queue.push(arr);
  queue.run(function() {
    callback(null, list);
    
  });

}

module.exports = files;
