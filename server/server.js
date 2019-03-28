const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

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

function grabRooms() {
  let rooms = io.sockets.adapter.rooms;
  let socketList = Object.keys(io.sockets.clients().sockets);
   socketList.forEach( socketID => delete rooms[socketID]);

  return rooms;
}

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('home', async (callback) => {
    socket.join('home');

    callback(null, Object.keys(grabRooms()))
  });


  //this goes to the client.

  //this is how you join a channel so only people in same group can see brodcast,etc.

  socket.on('join', (params, callback) => {
   
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }
    socket.leave('home');
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);
    console.log('WOOT', Object.keys(grabRooms()))
    socket.broadcast.to('home').emit('newRoom', {rooms:Object.keys(grabRooms()), type:"join"});

    //socket.leave('the Office Fans')

    // io.emit (everyone)
    // io.emit -> io.to('Room Name').emit (send everyone in specific room)
    // socket.broadcast.emit (everyone but user running script)
    // socket.broadcast.emit -> socket.broadcast.to('Room Name').emit (send everyone but user running script in said room name)
    // socket.emit (script running using)
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
      if(!Object.keys(grabRooms()).includes(user[0].room)) socket.broadcast.to('home').emit('newRoom', {rooms:Object.keys(grabRooms()), type:"disconnect", room:user[0].room});
      io.to(user[0].room).emit('updateUserList', users.getUserList(user[0].room));
      io.to(user[0].room).emit('newMessage', generateMessage('Admin', `${user[0].name} has left.`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server started on port:${port}.`);
});

//newMessage by server listen on client from,text,createdAt


//createMessage by client listen to server. from, text.