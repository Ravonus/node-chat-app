const socketClient = require('socket.io-client');
const _ = require('lodash');


module.exports = class SocketServer {
    constructor(server, token, rooms, options) {
      this.test = 'test';
      this.socket = socketClient(server, {query:`token=${token}`});
      this.token = token;
      this.rooms = rooms;
      this.users = options.users;
      this.io    = options.io;
      this.mainSocket = options.socket;
    }

    connect() {
        let that = this;
        let rooms = this.rooms;
        this.socket.on('connect', function(){
           
            console.log('connected',  that.rooms);
        });
    }

    usersFunction() {
        this.socket.on('grabUsers', function(room){
            console.log('da fuck')

            console.log('USERS', this.users.getUserList(room));
        });


        this.socket.on('userList', (list, room) => {
            console.log('list', [...this.users.getUserList(room), ...list])
            this.io.to(room).emit('updateUserList', [...this.users.getUserList(room), ...list]);
          });
        
    }

    pushRooms(roomName, type, room) {

        this.socket.emit(roomName, {rooms:this.rooms, type, room});
    }

    pullRooms() {

        this.socket.on('pushRooms', function(data){
           
 
        });
       
    }

    grabUsers(room, key) {
        console.log('ROOM', room)
        this.socket.emit('grabUsers', room, key);

        

    }

    init() {
        this.connect();
        this.usersFunction();
        
    }

}

