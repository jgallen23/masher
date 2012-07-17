var stylus = require('stylus');

try {
  var nib = require('nib');
} catch(e) {
}

module.exports = function(options, asset, next) {
  if (!asset.filepath.match(/\.styl$/)) 
    return next();
  var s = stylus(asset.source);
  s.set('filename', asset.filepath)
  if (nib) {
    s.use(nib());
    s.import('nib');
  }
  s.render(function(err, out) {
    if (err) throw err;
    asset.source = out;
    next();
  });
};
