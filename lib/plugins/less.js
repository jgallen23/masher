var less = require('less');

module.exports = function(options, asset, next) {
  if (!asset.filename.match(/\.less/)) 
    return next();
  less.render(asset.source, function (e, css) {
    asset.source = css;
    next();
  });
};
