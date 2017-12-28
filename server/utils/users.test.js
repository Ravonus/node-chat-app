const expect = require('expect');

const {
  Users
} = require('./users')
// import isRealString

// isRealString
// should reject non-string values 1,2,3 object
// should reject string with only spaces
// should accept string in both.



describe('Checking create user function', () => {
  var users;
  beforeEach(() => {
    users = new Users();
    users.users = [{
      id: 1,
      name: 'Mike',
      room: 'Node Course'
    }, {
      id: 2,
      name: 'Jen',
      room: 'React Course'
    }, {
      id: 3,
      name: 'Tank',
      room: 'Node Course'
    }]
  });
  it('should create a user', () => {
    var resUser = users.addUser('123', 'Chadder', 'Woot Room', )
    expect(users.users[3]).toMatch({
      id: 123,
      name: 'Chadder',
      room: 'Woot Room'
    });
  });

  it('should remove a user', () => {
    var removedUser = users.removeUser(2);
    expect(users.users[1]).toNotEqual({
      id: 2,
      name: 'Jen',
      room: 'React Course'
    });
    expect(users.users.length).toEqual(2);
  });

  it('should not remove a user', () => {
    var removedUser = users.removeUser(1337);
    expect(users.users.length).toEqual(3);
  });

  it('should find a user', () => {
    var getUser = users.getUser(2);
    expect(getUser).toEqual({
      id: 2,
      name: 'Jen',
      room: 'React Course'
    })
  });

  it('should not find a user', () => {
    var getUser = users.getUser(1337);
    expect(getUser).toBe(undefined)
  });
  it('should return names for node course', () => {
    var userList = users.getUserList('Node Course');
    expect(userList).toEqual(['Mike', 'Tank'])
  });
  it('should return names for react course', () => {
    var userList = users.getUserList('React Course');
    expect(userList).toEqual(['Jen'])
  });
});