var assert = require('assert');
var config = require('../lib/config'); 

/*
 config = {
  mash: [
    {
      name: ''
      files: []
    }
  ],
  options: {
    
  }
 }
*/

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
      assert.equal(obj[0].compress, true);
      assert.equal(obj[0].files.length, 2);
      assert.equal(obj[0].files[0], 'a.js');

      assert.equal(obj[1].version, 'v1');
      assert.equal(obj[1].compress, true);
      assert.equal(obj[1].files.length, 2);
      assert.equal(obj[1].files[0], 'stylea.css');
      done();
    });

  });

});
