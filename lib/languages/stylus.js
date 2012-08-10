var stylus = require('stylus');

module.exports = function(source, filename, next) {
  var s = stylus(source);
  s.set('filename', filename)
  s.render(function(err, out) {
    if (err) throw err;
    source = out;
    next(err, source, filename);
  });
};
