var fs = require('fs');
var path = require('path');
var Masher = require('./masher');

Masher.prototype.middleware = function(options) {
  var self = this;
  if (process.env.NODE_ENV == 'production') {
    console.warn('Masher middleware should not be used in production');
  }
  return function(req, res, next) {
    if (/\.(styl|js|less|css)($|\?)/.test(req.url)) {
      var file = req.url.split('?')[0];
      var fullpath = path.join(self.config.publicPath, file);
      fs.stat(fullpath, function(err, stats) {

        fs.readFile(fullpath, 'utf8', function(err, source) {
          if (err) throw err;
          var asset = {
            filepath: fullpath,
            filename: file,
            source: source
          };
          self.processPlugins(asset, self.config.plugins.pre, function() {
            res.setHeader('Content-Type', (/\.(styl|css|less)($|\?)/.test(req.url))?'text/css':'application/javascript');
            res.setHeader('Last-Modified', stats.mtime.toUTCString());
            if (req.method == 'GET')
              res.end(asset.source);
            else
              res.end();
          });
        });
      });
    } else {
      next();
    }
  };
};
