require('dotenv').config();
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const contentful = require('contentful');
const cors = require('cors');
const isSameDay = require('date-fns/isSameDay');

var client = contentful.createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  space: process.env.CONTENTFUL_SPACE_ID,
});

let userCount = 0;

app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/schedule', (req, res) => {
  client
    .getEntries({
      content_type: 'scheduleDay',
      include: 6,
    })
    .then(entries => {
      const today = entries.items.find(entry =>
        isSameDay(new Date(entry.fields.start), new Date()),
      );
      res.json({
        start: today.fields.start,
        patterns: today.fields.items.map(item => ({
          id: item.fields.pattern.fields.externalId,
          duration: item.fields.duration,
        })),
      });
    })
    .catch(err => {
      res.json(err);
    });
});

io.on('connection', socket => {
  let isUserAdded = false;
  socket.on('add user', msg => {
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

http.listen(5000, () => {
  console.log('listening on *:5000');
});
