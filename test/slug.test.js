var slug = require('../lib/util/slug');

describe('slug', function() {

  it('should replace spaces with dashes', function() {
    slug('test spaces').should.equal('test-spaces');
  });

  it('should replace / with -', function() {
    slug('test/slash').should.equal('test-slash');
  });

});
