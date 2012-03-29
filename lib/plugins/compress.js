
var uglifycss = require('./uglifycss');
var uglifyjs = require('./uglifyjs');
module.exports = function(options, asset, next) {
  uglifycss(options, asset, function() {
    uglifyjs(options, asset, next);
  });
};
