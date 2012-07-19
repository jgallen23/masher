var aug = require('aug');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var res = require('resistance');
var cjson = require('cjson');

var globalPlugins = {
  'stylus': './plugins/stylus',
  'compressCSS': './plugins/uglifycss',
  'compressJS': './plugins/uglifyjs',
  'compress': './plugins/compress',
  'hash': './plugins/hash',
  'less': './plugins/less'
};

var defaults = {
  assetPath: '',
  publicPath: '',
  outputDir: '',
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
    config = cjson.load(config);
  } else {
    this.root = process.cwd();
  }
  this.config = aug({}, config);
  
  this.config.assetPath = path.resolve(this.root, this.config.assetPath);
  this.config.publicPath = (this.config.publicPath) ? path.resolve(this.root, this.config.publicPath) : this.config.assetPath;
  this.config.outputPath = path.join(this.config.publicPath, this.config.outputDir);
  this.debug = (typeof debug !== 'undefined')?debug:(process.env.NODE_ENV != 'production');
  this.processInheritance();
  this.readMappingFile();
};

Masher.prototype.processInheritance = function() {
  for (var key in this.config.groups) {
    
    var group = this.config.groups[key];
    if (!group.scripts)
      group.scripts = [];
    if (!group.styles)
      group.styles = [];

    if (group.groups) {
      for (var i = 0, c = group.groups.length; i < c; i++) {
        var inheritName = group.groups[i];
        var inherit = this.config.groups[inheritName];
        if (inherit.styles)
          group.styles = inherit.styles.concat(group.styles);
        if (inherit.scripts)
          group.scripts = inherit.scripts.concat(group.scripts);
      }
    }
  }
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
        filepath: fullpath,
        filename: file,
        source: source
      };
      //pre-process plugins
      var plugins = self.config.plugins.pre;
      var groupPlugins = self.config.groups[key].plugins;
      if (groupPlugins && groupPlugins.pre)
        plugins = plugins.concat(groupPlugins.pre);

      self.processPlugins(asset, plugins, function() {
        next(asset);
      });
    });
  });

  queue.push(files);
  queue.run(function(assets) {
    var source = self.concat(assets);
    var group = {
      key: key,
      filepath: path.join(self.config.outputPath, key+extension),
      filename: path.join(self.config.outputDir, key+extension),
      source: source
    };
    var postPlugins = self.config.plugins.post;
    var groupPlugins = self.config.groups[key].plugins;
    if (groupPlugins && groupPlugins.post)
      postPlugins = postPlugins.concat(groupPlugins.post);

    self.processPlugins(group, postPlugins, function() {
      mkdirp(path.dirname(group.filepath), function(err) {
        if (err) throw err;
        fs.writeFile(group.filepath, group.source, function(err) {
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
  if (!files || files.length === 0)
    return callback(null);
  var stylesPath = path.join(this.config.assetPath, this.config.stylesPath);
  this.processAssets(stylesPath, key, files, '.css', callback);
};

Masher.prototype.buildScripts = function(key, files, callback) {
  if (!files || files.length === 0)
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

Masher.prototype.getSize = function(source) {
  var toKB = function(bytes) {
    return (bytes / 1024).toFixed(2);
  };
  var bytes = Buffer.byteLength(source);
  var kb = toKB(bytes);
  return kb;
};

Masher.prototype.build = function(callback) {
  var self = this;
  this.debug = false;
  var queue = res.queue(function(key, next) {
    self.buildGroup(key, self.config.groups[key], function(group) {
      if (group.style) {
        self.config.groups[key].styleOut = group.style.filename;
        self.config.groups[key].styleSize = self.getSize(group.style.source);
      }
      if (group.script) {
        self.config.groups[key].scriptOut = group.script.filename;
        self.config.groups[key].scriptSize = self.getSize(group.script.source);
      }
      next();
    });
  });
  for (var groupKey in this.config.groups) {
    queue.push(groupKey);
  }
  queue.run(function() {
    self.writeMappingFile(function() {
      if (callback) callback();
    });
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

Masher.prototype.readMappingFile = function(cb) {
  if (this.config.mappingPath) {
    var self = this;
    if (path.existsSync(this.config.mappingPath)) {
      fs.readFile(this.config.mappingPath, 'utf8', function(err, str) {
        var mapping = JSON.parse(str);
        for (var key in self.config.groups) {
          if (!mapping[key])
            continue;
          self.config.groups[key].scriptOut = mapping[key].script;
          self.config.groups[key].styleOut = mapping[key].style;
        }
      });
    }
  }
};

Masher.prototype.writeMappingFile = function(cb) {
  if (this.config.mappingPath) {
    var map = this.getMapping();
    fs.writeFile(this.config.mappingPath, JSON.stringify(map), function(err) {
      if (err) throw err;
      cb();
    });
  } else {
    cb();
  }
};


module.exports = Masher;
