var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

module.exports = function(options, asset, next) {

  var md5sum = crypto.createHash('md5');

  md5sum.update(asset.source);

  var d = md5sum.digest('hex');
  var hash = d.substr(0, 8);
  var extname = path.extname(asset.filepath);
  asset.filepath = asset.filepath.replace(extname, '-'+hash+extname);
  asset.filename = asset.filename.replace(extname, '-'+hash+extname);
  next();
};
