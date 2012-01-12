var http = require('http');
var express = require('express');
var res = http.ServerResponse.prototype;

var old = res.render;
res.render = function() {
  var args = Array.prototype.slice.call(arguments);
  var self = this; 
  var fn = args[2];
  args[2] = function(err, str) {
    if (err)
      return console.log(err);
    var masher = self.__dynamicHelpers.masher;
    console.log(str);
    masher.replacePlaceholders(str, function(str) {
      console.log(str);
      if (fn) 
        fn(err, str);
      else
        self.send(str);
    });
  };
  return old.apply(this, args);
};

