var fs = require('fs');
var path = require('path');
var Masher = require('./masher');

var cache = {};
Masher.prototype.middleware = function(options) {
  var self = this;
  if (process.env.NODE_ENV == 'production') {
    console.warn('Masher middleware should not be used in production');
  }

  var serve = function(res, fullpath) {
    res.setHeader('Content-Type', cache[fullpath].contentType);
    res.end(cache[fullpath].source);
  };
  return function(req, res, next) {
    if (/\.(styl|js|less|css)($|\?)/.test(req.url)) {
      var file = req.url.split('?')[0];
      var fullpath = path.join(self.config.publicPath, file);
      fs.stat(fullpath, function(err, stats) {

        if (cache[fullpath] && cache[fullpath].modified == stats.mtime.getTime()) {
          return serve(res, fullpath);
        }

        fs.readFile(fullpath, 'utf8', function(err, source) {
          if (err) throw err;
          var asset = {
            filepath: fullpath,
            filename: file,
            source: source
          };
          self.processPlugins(asset, self.config.plugins.pre, function() {
            cache[fullpath] = {
              contentType: (/\.(styl|css|less)($|\?)/.test(req.url))?'text/css':'application/javascript',
              source: asset.source,
              modified: stats.mtime.getTime()
            };
            serve(res, fullpath);
          });
        });
      });
    } else {
      next();
    }
  };
};
