var express = require("express"),
    path = require("path"),
    stylus = require("stylus");

var argv = require('optimist').argv;
var masher = require("../");

var app = express.createServer();
var port = argv.port || 3000;

app.configure(function() {
  app.use(express.logger());
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);

  masher.helpExpress(app);

  app.helpers({
  });
  app.set("views", "" + __dirname + "/views");
  app.set("view options", {
    layout: "layout" 
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

app.listen(port, "0.0.0.0");
