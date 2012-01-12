var render = require('./render');
var Masher = require('./masher');

var inProduction = (process.env.NODE_ENV == "production");
var _cache = {};
module.exports = function(app, options) {
  app.dynamicHelpers({
    masher: function(req, res) {
      if (!inProduction || !_cache[req.url]) {
        _cache[req.url] = new Masher(req.url, options);
      }
      return _cache[req.url];
    }
  });
};
