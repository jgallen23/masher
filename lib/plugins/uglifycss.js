
var uglify = require('uglifycss');

module.exports = function(options, asset, next) {
  if (!asset.filename.match(/\.css$/)) 
    return next();
  asset.source = uglify.processString(asset.source);
  next();
};
