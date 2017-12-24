const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 1337;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  //this goes to the client.
  socket.emit('welcomeMessage', {
    from: 'Admin Chad',
    text: 'Welcome homie, how are you?',
    createAt: new Date().getTime()
  })

  //this brodcast to everyone, but the client that started it.
  socket.broadcast.emit('welcomeMessage', {
    from: 'Admin Chad',
    text: 'New user just join yall.',
    createAt: new Date().getTime()
  });

  socket.on('createMessage', (message) => {
    console.log('createdMessage', message);
    io.emit('newMessage', {
      from: message.from,
      text: message.text,
      createAt: new Date().getTime()
    })
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server fucking started on port:${port}.`);
});

//newMessage by server listen on client from,text,createdAt


//createMessage by client listen to server. from, text.