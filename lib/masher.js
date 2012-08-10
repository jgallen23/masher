var config = require('./config');
var mashSet = require('./set');

var masher = function(obj, callback) {
  if (typeof obj == 'string') {
    config(obj, function(err, arr) {
      mashSet(arr, callback);
    });
  } else {
    if (!obj instanceof Array) {
      obj = [obj];
    }
    mashSet(obj, callback);
  }

}


module.exports = masher;
