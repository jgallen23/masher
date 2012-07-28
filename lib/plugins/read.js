var resistance = require('resistance');
var fs = require('fs');
var types = require('../map').types;
var path = require('path');

var read = function(files, callback) {

  var assetType;
  var queue = resistance.queue(function(file, next) {

    var ext = path.extname(file);

    var type = types[ext];
    if (!type) {
      throw new Error(ext + ' is an unknown type');
    }
    if (assetType && assetType != type) {
      throw new Error('you are mixing types, that doesn\'t work so well');
    }
    assetType = type;

    fs.readFile(file, 'utf8', function(err, source) {
      next({
        filename: file,
        source: source
      });
    });
  });

  queue.push(files);
  queue.run(function() {
    callback(null, this, assetType);
  });
}

module.exports = read;
