var fs = require('fs');
var path = require('path');
var strf = require('strf');
var Masher = require('./masher');

var inlineCache = {};
Masher.prototype.helper = function() {
  var self = this;
  return {
    script: function(groupName, inline) {
      var format = '<script src="{0}"></script>';
      if (self.debug) {
        var out = [];
        var scripts = self.config.groups[groupName].scripts;
        if (!scripts)
          return '';
        for (var i = 0, c = scripts.length; i < c; i++) {
          var script = scripts[i];
          var scriptsPath = self.config.scriptsPath || '';
          out.push(strf(format, path.join(scriptsPath, script)));
        }
        return out.join('\n');
      } else {
        var script = self.config.groups[groupName].scriptOut;
        if (!inline) {
          return strf(format, script);
        } else {
          if (!inlineCache[script]) {
            //TODO: remove sync when express gets async helpers
            var contents = fs.readFileSync(path.join(self.config.assetPath, script), 'utf8');
            inlineCache[script] = '<script>'+contents+'</script>';
          }
          return inlineCache[script];
        }
      }
    },
    style: function(groupName, inline) {
      var format = '<link rel="stylesheet" href="{0}"/>';
      if (self.debug) {
        var out = [];
        var styles = self.config.groups[groupName].styles;
        if (!styles)
          return '';
        for (var i = 0, c = styles.length; i < c; i++) {
          var style = styles[i];
          var stylesPath = self.config.stylesPath || '';
          out.push(strf(format, path.join(stylesPath, style)));
        }
        return out.join('\n');
      } else {
        var style = self.config.groups[groupName].styleOut;
        if (!inline) {
          return strf(format, style);
        } else {
          if (!inlineCache[style]) {
            //TODO: remove sync when express gets async helpers
            var contents = fs.readFileSync(path.join(self.config.assetPath, style), 'utf8');
            inlineCache[style] = '<style>'+contents+'</style>';
          }
          return inlineCache[style];
        }
      }
    }
  };
};
