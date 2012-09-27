var assert = require('assert');

var files = require('../lib/plugins/files');

var fixturePath = __dirname + '/fixtures/';

suite('files', function() {

  test('returns files', function(done) {

    var file1 = fixturePath + 'a.js';
    var file2 = fixturePath + 'b.js';
    files([file1, file2], function(err, list) {

      assert.equal(err, null);
      assert.equal(list.length, 2);
      assert.equal(list[0], file1);
      assert.equal(list[1], file2);
      done();
    });
    
  });

  test('checks that file exists', function(done) {
    
    var file1 = fixturePath + 'poop.js';
    var file2 = fixturePath + 'b.js';
    files([file1, file2], function(err, list) {

      assert.notEqual(err, null);
      console.log(err);
      done();
    });
  });

  test('expands glob', function(done) {
    
    files([fixturePath + 'dir/*.js'], function(err, list) {

      assert.equal(err, null);
      assert.equal(list.length, 2);
      done();
    });
  });
});
