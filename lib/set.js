var res = require('resistance');
var mash = require('./mash');

module.exports = function(arr, callback) {
  var queue = res.queue(function(data, next) {
    mash(data, function(err, source, filename) {
      next({
        source: source,
        filename: filename
      });
    });
  });
  queue.push(arr);

  queue.run(function() {
    var results = Array.prototype.slice.call(arguments);
    results.splice(0, 0, false);
    callback.apply(results, results);
  });
}
