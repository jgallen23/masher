var less = require('less');
var path = require('path');

module.exports = function(options, asset, next) {
  if (!asset.filename.match(/\.less/)) 
    return next();
  var parser = new (less.Parser)({
    paths: [path.dirname(asset.filename)],
    filename: asset.filename
  });
  parser.parse(asset.source, function (e, tree) {
    if (e) throw e;
    asset.source = tree.toCSS();
    next();
  });
};
