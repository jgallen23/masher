var uglifyCss = require('uglifycss');
var uglifyJs = require('uglify-js');


var showCopyright = function(comments) {
  var ret = "";
  for (var i = 0; i < comments.length; ++i) {
    var c = comments[i];
    if (c.type == "comment1") {
      ret += "//" + c.value + "\n";
    } else {
      ret += "/*" + c.value + "*/";
    }
  }
  return ret;
};

module.exports = function(source, type, copyright, callback) {

  var out = "";
  if (type == 'style') {
    out = uglifyCss.processString(source);
  } else if (type == 'script') {
    try {
      if (copyright) {
        var tok = uglifyJs.parser.tokenizer(source), c;
        c = tok();
        out += showCopyright(c.comments_before);
      }
      var ast = uglifyJs.parser.parse(source);
      ast = uglifyJs.uglify.ast_mangle(ast);
      ast = uglifyJs.uglify.ast_squeeze(ast);
      out += uglifyJs.uglify.gen_code(ast);
    } catch(e) {
      throw e;
    }
  }
  callback(null, out, type);
};
