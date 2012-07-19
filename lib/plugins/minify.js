var uglifyCss = require('uglifycss');
var uglifyJs = require('uglify-js');

module.exports = function(source, type, callback) {

  if (type == 'style') {
    source = uglifyCss.processString(source);
  } else if (type == 'script') {
    var ast = uglifyJs.parser.parse(source);
    ast = uglifyJs.uglify.ast_mangle(ast);
    ast = uglifyJs.uglify.ast_squeeze(ast);
    source = uglifyJs.uglify.gen_code(ast);
  }
  callback(null, source, type);
};
