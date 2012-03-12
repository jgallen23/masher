var aug = require('aug');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var res = require('resistance');
var strf = require('strf');

var globalPlugins = {
  'stylus': './plugins/stylus',
  'uglifycss': './plugins/uglifycss',
  'uglifyjs': './plugins/uglifyjs',
  'hash': './plugins/hash'
};

var defaults = {
  assetPath: '',
  outputPath: '',
  scriptsPath: '',
  stylesPath: '',
  groups: {
  },
  plugins: {
    pre: false,
    post: false 
  }
};

var normalize = function(path) {
  if (path[path.length-1] != '/')
    return path+'/';
  return path;
};

var Masher = function(config, debug) {
  if (typeof config === 'string') {
    this.root = path.dirname(config);
    config = JSON.parse(fs.readFileSync(config, 'utf8'));
  } else {
    this.root = process.cwd();
  }
  this.config = aug({}, config);
  
  this.config.assetPath = normalize(path.join(this.root, this.config.assetPath));
  this.config.outputPath = normalize(path.join(this.root, this.config.outputPath));
  this.debug = (typeof debug !== 'undefined')?debug:(process.env.NODE_ENV != 'production');
};

Masher.prototype.processPlugins = function(asset, plugins, cb) {
  var queue = res.queue(function(plugin, next) {
    var options = {};
    if (typeof plugin !== 'string') {
      options = plugin[1];
      plugin = plugin[0];
    }
    plugin = globalPlugins[plugin] || plugin;

    require(plugin)(options, asset, function(err) {
      if (err) throw err;
      next();
    });
    
  }, true);

  queue.push(plugins);
  queue.run(function() {
    cb(asset);
  });
  
};

Masher.prototype.processAssets = function(root, key, files, extension, callback) {
  var self = this;
  var queue = res.queue(function(file, next) {
    var fullpath = path.join(root, file);
    fs.readFile(fullpath, 'utf8', function(err, source) {
      if (err) throw err;
      var asset = {
        key: key,
        filename: fullpath,
        source: source
      };
      //pre-process plugins
      self.processPlugins(asset, self.config.plugins.pre, function() {
        next(asset);
      });
    });
  });

  queue.push(files);
  queue.run(function(assets) {
    var source = self.concat(assets);
    var group = {
      key: key,
      filename: path.join(self.config.outputPath, key+extension),
      source: source
    };
    var postPlugins = ['uglifycss', 'uglifyjs'].concat(self.config.plugins.post);
    self.processPlugins(group, postPlugins, function() {
      mkdirp(path.dirname(group.filename), function(err) {
        if (err) throw err;
        fs.writeFile(group.filename, group.source, function(err) {
          if (err) throw err;
          if (callback) callback(group);
        });
      });
    });
  });
};

Masher.prototype.concat = function(assets) {
  var out = [];
  for (var i = 0, c = assets.length; i < c; i++) {
    var asset = assets[i];
    out.push(asset.source);
  }
  return out.join('\n');
};

Masher.prototype.buildStyles = function(key, files, callback) {
  if (!files)
    return callback(null);
  var stylesPath = path.join(this.config.assetPath, this.config.stylesPath);
  this.processAssets(stylesPath, key, files, '.css', callback);
};

Masher.prototype.buildScripts = function(key, files, callback) {
  if (!files)
    return callback(null);
  var scriptsPath = path.join(this.config.assetPath, this.config.scriptsPath);
  this.processAssets(scriptsPath, key, files, '.js', callback);
};

Masher.prototype.buildGroup = function(name, group, next) {
  var self = this;
  res.parallel([
    function(next) {
      self.buildStyles(name, group.styles, next);
    },
    function(next) {
      self.buildScripts(name, group.scripts, next);
    }
  ], function(g) {
    next({
      style: g[0],
      script: g[1]
    });
  });
};

Masher.prototype.build = function(callback) {
  var self = this;
  var queue = res.queue(function(key, next) {
    self.buildGroup(key, self.config.groups[key], function(group) {
      if (group.style)
        self.config.groups[key].styleOut = (self.config.assetPath != '.')?group.style.filename.replace(self.config.assetPath, ''):group.style.filename;
      if (group.script)
        self.config.groups[key].scriptOut = (self.config.assetPath != '.')?group.script.filename.replace(self.config.assetPath, ''):group.script.filename;
      next();
    });
  });
  for (var groupKey in this.config.groups) {
    queue.push(groupKey);
  }
  queue.run(function() {
    if (callback) callback();
  });
};

Masher.prototype.getMapping = function() {
  var mapping = {};
  for (var key in this.config.groups) {
    mapping[key] = {
      script: this.config.groups[key].scriptOut,
      style: this.config.groups[key].styleOut
    };
  }
  return mapping;
};

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

module.exports = Masher;
