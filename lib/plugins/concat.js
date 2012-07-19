var resistance = require('resistance');
var preprocessors = require('./preprocessors');

var concat = function(files, callback) {
  var assetType;
  var queue = resistance.queue(function(file, next) {
    preprocessors(file, function(err, results, type) {
      if (err)
        throw err;
      if (assetType && type != assetType) {
        throw new Error('you are mixing styles with scripts, that doesn\'t work');
      }
      assetType = type;
      next(results);
    });
  });

  queue.push(files);
  queue.run(function() {

    callback(null, this.join('\n'), assetType);

  });
}

module.exports = concat;
