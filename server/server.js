const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const socketConfig = require('../config/socket.json');
const _ = require('lodash');

let sc = require('./socketClient');
let servers = {};

const {
  generateMessage,
  generateLocationMessage
} = require('./utils/message');
const {
  isRealString
} = require('./utils/validation');
const {
  Users
} = require('./utils/users');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 1337;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();



async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }

}


function loopSocket(roomName, type, room) {



  socketConfig.hosts.forEach(server => {
    let socket = servers[server.token];
    socket.grabUsers(room, socketConfig.token);

    socket.rooms = Object.keys(grabRooms());
    if (!room || room !== undefined) {
      socket.pushRooms(roomName, type, room);
    } else {
      socket.pushRooms(roomName, type);
    }
  });

}

if (socketConfig.hosts.length > 1) {

} else {
  socketConfig.hosts.forEach(server => {
    servers[server.token] = new sc(server.url, server.token, Object.keys(grabRooms()), {io,users});
    servers[server.token].init();
  });

}


function grabRooms() {
  let rooms = io.sockets.adapter.rooms;
  let socketList = Object.keys(io.sockets.clients().sockets);
  socketList.forEach(socketID => delete rooms[socketID]);

  return rooms;
}

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');
  let handshakeData = socket.request;
  let token = handshakeData._query['token'];


  socket.on('home', async (callback) => {
    socket.join('home');
    callback(null, Object.keys(grabRooms()))

  });

  loopSocket('newRoom', 'join')


  if (servers[token]) {

    let server = servers[token];
    servers[token].rooms = Object.keys(grabRooms());
    servers[token].pushRooms('newRoom', 'join');
    socket.emit('pushRooms', servers[token].rooms);
    // console.log(servers[token])
  }
  //this goes to the client.

  //this is how you join a channel so only people in same group can see brodcast,etc.

  socket.on('join', async (params, callback) => {

    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }
    socket.leave('home');
    socket.join(params.room);
    users.removeUser(socket.id);



    users.addUser(socket.id, params.name, params.room);
    loopSocket('newRoomPush', 'join');

    socket.broadcast.to('home').emit('newRoom', {
      rooms: Object.keys(grabRooms()),
      type: 'join'
    });



    //socket.leave('the Office Fans')

    // io.emit (everyone)
    // io.emit -> io.to('Room Name').emit (send everyone in specific room)
    // socket.broadcast.emit (everyone but user running script)
    // socket.broadcast.emit -> socket.broadcast.to('Room Name').emit (send everyone but user running script in said room name)
    // socket.emit (script running using)

    

    asyncForEach( Object.keys(servers), async (key) => {
  
        let socket = servers[key];
        socket.grabUsers(params.room, socketConfig.token);
    });
    
    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app. By Chad Koslovsky'))
    
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));

    callback();
  });

  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);
    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }

    callback();
  });

  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);
    if (user) {
      io.to(user.room).emit('newLocationMessage', generateMessage(user.name, coords.latitude, coords.longitude));
    }
  })

  socket.on('disconnect', () => {

    var user = users.removeUser(socket.id);

    if (user[0]) {
      if (!Object.keys(grabRooms()).includes(user[0].room)) socket.broadcast.to('home').emit('newRoom', {
        rooms: Object.keys(grabRooms()),
        type: "disconnect",
        room: user[0].room
      });
      io.to(user[0].room).emit('updateUserList', users.getUserList(user[0].room));
      io.to(user[0].room).emit('newMessage', generateMessage('Admin', `${user[0].name} has left.`));

      loopSocket('newRoom', 'disconnect', user[0].room);

    }
  });

  socket.on('grabUsers', (room) => {
    socket.emit('userList', users.getUserList(room), room)
  });

  socket.on('userList', (list, room) => {
    io.to(room).emit('updateUserList', _.merge(users.getUserList(room)), list);
  });

  socket.on('newRoom', (data) => {
    if(data.room && data.type === 'disconnect') {
      if (!Object.keys(grabRooms()).includes(data.room )) socket.broadcast.to('home').emit('newRoom', {
        rooms: Object.keys(grabRooms()),
        type: "disconnect",
        room: data.room
      });
    }
    loopSocket('newRoomPush', data.type, data.room);


  });

  socket.on('newRoomPush', (data) => {
    console.log(data);
    socket.broadcast.to('home').emit('newRoom', {
      rooms: _.merge(Object.keys(grabRooms()), data.rooms),
      type: data.type
    });

  });

});

server.listen(port, () => {
  console.log(`Server started on port:${port}.`);
});

//newMessage by server listen on client from,text,createdAt


//createMessage by client listen to server. from, text.