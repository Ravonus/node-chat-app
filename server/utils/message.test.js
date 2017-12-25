var expect = require('expect');

var {
  generateMessage,
  generateLocationMessage
} = require('./message');

describe('generateMessage', () => {
  it('should generate correct message object', () => {

    var from = 'James Gayman';
    var text = 'Text to send';
    var message = generateMessage(from, text);

    expect(message.createAt).toBeA('number');
    expect(message).toInclude({
      from,
      text
    });
  });
});

describe('generateLocationMessage', () => {
  it('should generate correct location object', () => {
    var from = 'Admin';
    var latitude = '1';
    var longitude = '2';
    var url = 'https://www.google.com/maps?q=1,2';
    var location = generateLocationMessage(from, latitude, longitude);

    expect(location.createAt).toBeA('number');
    expect(location.from).toBe(from);
    expect(location).toInclude({
      from,
      url
    });
  });
});