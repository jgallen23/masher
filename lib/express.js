
var http = require('http');
var express = require('express');
var res = http.ServerResponse.prototype;

var old = res.render;
res.render = function(name, data, fn) {
  var self = this; 
  return old.call(this, name, data, function(err, str) {
    if (!data.isPartial) {
      var masher = self.__dynamicHelpers.masher;
      str = masher.replacePlaceholder(str);
      if (fn) 
        fn();
      else
        self.send(str);
    }
  });
};

