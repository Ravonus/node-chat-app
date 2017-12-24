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

  socket.emit('newMessage', {
    from: 'james fag',
    text: 'Hey, I may be gay.',
    createAt: 164
  });

  socket.on('createMessage', (newMessage) => {
    console.log('createdMessage', newMessage);
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