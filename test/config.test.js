var assert = require('assert');
var config = require('../lib/config'); 

var fixturePath = __dirname + '/fixtures/';

suite('config', function() {

  test('normal json config', function(done) {
    config(fixturePath + 'config.json', function(err, obj) {

      assert.equal(obj.length, 1);
      assert.equal(obj[0].files.length, 2);
      done();

    });
  });
  test('normal yaml config', function(done) {

    config(fixturePath + 'config.yaml', function(err, obj) {

      assert.equal(obj.length, 1);
      assert.equal(obj[0].files.length, 2);
      done();

    });
  });

  test('config with global options', function(done) {

    config(fixturePath + 'config2.yaml', function(err, obj) {

      assert.equal(obj.length, 2);

      assert.equal(obj[0].version, 'v1.1');
      assert.equal(obj[0].minify, true);
      assert.equal(obj[0].files.length, 2);
      assert.equal(obj[0].files[0], 'test/fixtures/a.js');

      assert.equal(obj[1].version, 'v1');
      assert.equal(obj[1].minify, true);
      assert.equal(obj[1].files.length, 2);
      assert.equal(obj[1].files[0], 'test/fixtures/stylea.css');
      done();
    });

  });

  test('config with custom defaults', function(done) {

    var defaults = {
      minify: true
    }
    config(fixturePath + 'config3.yaml', defaults, function(err, obj) {

      assert.equal(obj.length, 2);

      assert.equal(obj[0].name, 'mashed');
      assert.equal(obj[0].version, 'v1.1');
      assert.equal(obj[0].minify, true);
      assert.equal(obj[0].files.length, 2);
      assert.equal(obj[0].files[0], 'test/fixtures/a.js');

      assert.equal(obj[1].name, 'mashed');
      assert.equal(obj[1].version, 'v1');
      assert.equal(obj[1].minify, true);
      assert.equal(obj[1].files.length, 2);
      assert.equal(obj[1].files[0], 'test/fixtures/stylea.css');
      done();
    });

  });

});
