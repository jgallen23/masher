var http = require('http');
var express = require('express');
var res = http.ServerResponse.prototype;

var old = res.render;
res.render = function(name, data, fn, parent, sub) {
  var self = this; 
  var ofn = fn;
  fn = function(err, str) {
    if (err)
      return console.log(err);
    var masher = self.__dynamicHelpers.masher;
    str = masher.replacePlaceholder(str);
    if (ofn) 
      ofn(err, str);
    else
      self.send(str);
  };
  return old.apply(this, arguments);
};

