var path = require('path');
var strf = require('strf');
var Masher = require('./masher');

Masher.prototype.helper = function() {
  var self = this;
  return {
    script: function(groupName) {
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
        return strf(format, self.config.groups[groupName].scriptOut);
      }
    },
    style: function(groupName) {
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
        return strf(format, self.config.groups[groupName].styleOut);
      }
    }
  };
};
