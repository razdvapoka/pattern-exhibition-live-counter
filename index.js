const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let userCount = 0;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  let isUserAdded = false;
  socket.on('add user', () => {
    if (!isUserAdded) {
      isUserAdded = true;
      userCount++;
      io.sockets.emit('user joined', {
        userCount,
      });
    }
  });
  socket.on('disconnect', () => {
    if (isUserAdded) {
      userCount--;
      io.sockets.emit('user left', {
        userCount,
      });
    }
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
