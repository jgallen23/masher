var assert = require('assert');
var fs = require('fs');

var read = require('../lib/plugins/read');
var fixturePath = __dirname + '/fixtures/';

var readFixture = function(name, ext) {
  ext = ext || '.js';
  return fs.readFileSync(fixturePath + name+ext, 'utf8');
}

suite('read', function() {

  test('should read files passed in', function(done) {

    var file1 = fixturePath + 'a.js';
    var file2 = fixturePath + 'b.js';
    read([file1, file2], function(err, out, assetType) {
      assert.equal(err, null);
      assert.equal(out.length, 2);

      assert.equal(out[0].filename, file1);
      assert.equal(out[0].source, readFixture('a'));
      assert.equal(out[1].filename, file2);
      assert.equal(out[1].source, readFixture('b'));

      assert.equal(assetType, 'script');

      done();
    });
    
  });

  //test('should throw error if mixing asset types', function(done) {

    //assert.throws(function() {
      //var file1 = fixturePath + 'a.js';
      //var file2 = fixturePath + 'stylea.css';
      //read([file1, file2], function(err, out, assetType) {
        //done();
      //});
    //});
  //});

});
