var aug = require('aug');
var yaml = require('js-yaml');
var fs = require('fs');

var defaults = require('./defaults');

module.exports = function(file, callback) {


  fs.readFile(file, 'utf8', function(err, str) {
    if (err) {
      return callback(err);
    }

    var obj = yaml.load(str);

    var mashObj = [];

    var globalOptions = obj.options || {};

    obj.mash.forEach(function(item, i) {
      mashObj.push(aug({}, defaults, globalOptions, item));
    });

    callback(err, mashObj);

  });


}
