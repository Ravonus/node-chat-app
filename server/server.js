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

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  //this goes to the client.

  //this is how you join a channel so only people in same group can see brodcast,etc.

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room name are required.');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);


    //socket.leave('the Office Fans')

    // io.emit (everyone)
    // io.emit -> io.to('Room Name').emit (send everyone in specific room)
    // socket.broadcast.emit (everyone but user running script)
    // socket.broadcast.emit -> socket.broadcast.to('Room Name').emit (send everyone but user running script in said room name)
    // socket.emit (script running using)
    io.to(params.room).emit('updateUserList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', 'Welcome to da mofucken chat app.'))
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has mo fucken join.`));
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
    if (user) {
      io.to(user[0].room).emit('updateUserList', users.getUserList(user[0].room));
      io.to(user[0].room).emit('newMessage', generateMessage('Admin', `${user[0].name} has fucking left.`));
    }
  });
});

server.listen(port, () => {
  console.log(`Server fucking started on port:${port}.`);
});

//newMessage by server listen on client from,text,createdAt


//createMessage by client listen to server. from, text.