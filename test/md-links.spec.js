const mdLinks = require('../src/index.js');


describe('mdLinks', () => {

  it('should be a function', () => {
    return fetchData().then(data => {
      expect(typeof mdLinks).toBe("function");
    });
  });

});
