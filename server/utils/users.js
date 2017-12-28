//addUser(id, name, room)
//removeUser(id)
//fetchUser(id)
//getUserList(room)

class Users {
  constructor() {
    this.users = [];
  }
  addUser(id, name, room) {
    var user = {
      id,
      name,
      room
    };
    this.users.push(user);
    return user;
  }
  removeUser(id) {
    // return user that was removed
    var newUsers = this.users.filter((user) => user.id !== id);
    var users = this.users.filter((user) => user.id === id);
    this.users = newUsers;
    return users;
  }
  getUser(id) {
    return this.users.filter((user) => user.id === id)[0];
  }
  getUserList(room) {
    var users = this.users.filter((user) => user.room === room);
    var namesArray = users.map((user) => user.name);
    return namesArray;
  }
}

//var me = new Person(id, name, room);

module.exports = {
  Users
}