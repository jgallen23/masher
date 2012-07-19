var stylus = require('stylus');

try {
  var nib = require('nib');
} catch(e) {
}

module.exports = function(source, filename, next) {
  var s = stylus(source);
  s.set('filename', filename)
  if (nib) {
    s.use(nib());
    s.import('nib');
  }
  s.render(function(err, out) {
    if (err) throw err;
    source = out;
    next(err, source, filename);
  });
};
