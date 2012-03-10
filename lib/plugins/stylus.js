var stylus = require('stylus');

module.exports = function(options, asset, next) {
  if (!asset.filename.match(/\.styl$/)) 
    return next();
  stylus(asset.source)
    .set('filename', asset.filename)
    .render(function(err, out) {
      asset.source = out;
      next();
    });
};
