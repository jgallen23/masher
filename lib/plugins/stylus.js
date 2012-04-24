var stylus = require('stylus');

module.exports = function(options, asset, next) {
  if (!asset.filepath.match(/\.styl$/)) 
    return next();
  stylus(asset.source)
    .set('filename', asset.filepath)
    .render(function(err, out) {
      if (err) throw err;
      asset.source = out;
      next();
    });
};
