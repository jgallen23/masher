var path = require('path');
var fs = require('fs');


var imports = {
  '.styl': function(file, callback) {
    var stylus = require('stylus');
    fs.readFile(file, 'utf8', function(err, source) {
      var options = {
        filename: file,
        _imports: []
      }
      var style = stylus(source, options);
      style.render(function(err, css) {
        var imports = [];
        options._imports.map(function(item) {
          if (item.path) {
            imports.push(item.path);
          }
        });
        callback(null, imports);
      });
    });
  }
}


module.exports = function(file, callback) {

  var ext = path.extname(file);
  if (imports[ext]) {
    imports[ext](file, callback);
  } 
}
