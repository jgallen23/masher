
var uglify = require('uglifycss');

module.exports = function(options, asset, next) {
  if (!asset.filepath.match(/\.css$/)) 
    return next();
  asset.source = uglify.processString(asset.source);
  next();
};
