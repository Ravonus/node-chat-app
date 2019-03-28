const expect = require('expect');

const {
  isRealString
} = require('./validation')
// import isRealString

// isRealString
// should reject non-string values 1,2,3 object
// should reject string with only spaces
// should accept string in both.

describe('Checking isRealString function', () => {
  it('should reject non-string values', () => {
    var res = isRealString(123);
    expect(res).toBe(false)
  });
  it('should reject string with only spaces', () => {
    var res = isRealString('          ');
    expect(res).toBe(false)
  });
  it('it should work.', () => {
    var res = isRealString('  work, baby, work.   ');
    expect(res).toBe(true)
  });
});