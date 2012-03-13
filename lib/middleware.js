var fs = require('fs');
var path = require('path');
var Masher = require('./masher');

Masher.prototype.middleware = function(options) {
  var self = this;
  if (process.env.NODE_ENV == 'production') {
    console.warn('Masher middleware should not be used in production');
  }
  return function(req, res, next) {
    if (/\.(styl|js|css)$/.test(req.url)) {
      var filename = path.join(self.config.assetPath, req.url);
      fs.readFile(filename, 'utf8', function(err, source) {
        if (err) throw err;
        var asset = {
          filename: filename,
          source: source
        };
        self.processPlugins(asset, self.config.plugins.pre, function() {
          res.setHeader('Content-Type', (/\.(styl|css)$/.test(req.url))?'text/css':'application/javascript');
          res.end(asset.source);
        });
      });
    } else {
      next();
    }
  };
};
