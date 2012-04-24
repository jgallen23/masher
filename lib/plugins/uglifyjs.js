var uglifyJs = require('uglify-js');

module.exports = function(options, asset, next) {
  if (!asset.filepath.match(/\.js/)) 
    return next();
  var ast = uglifyJs.parser.parse(asset.source);
  ast = uglifyJs.uglify.ast_mangle(ast);
  ast = uglifyJs.uglify.ast_squeeze(ast);
  asset.source = uglifyJs.uglify.gen_code(ast);
  next();
};
