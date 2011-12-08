var express = require("express");
var path = require("path");
//require("mongoose");
//require("express-mongoose");

var argv = require('optimist').argv;
var masher = require("../");

var app = express.createServer();
var port = argv.port || 3000;

app.configure(function() {
  //app.use(express.logger());
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);

  masher.helpExpress(app, {
    basePath: 'public',
    compress: false
  });

  app.helpers({
  });
  app.set("views", "" + __dirname + "/views");
  app.set("view options", {
    layout: false//"layout" 
  });
  app.set("view engine", "jade");

  app.use(express.static(__dirname + "/public"));
});
app.configure("development", function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});
app.configure("production", function() {
  app.use(express.errorHandler());
});


app.get("/", function(req, res) {
  res.render("index", {
  });
});

app.get("/page2", function(req, res) {
  res.render("page2", {
  });
});
app.listen(port, "0.0.0.0");
