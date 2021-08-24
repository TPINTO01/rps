const uuidv4 = require('uuid').v4;

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on('choice', (choice) => this.handleChoice(choice));
    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      console.log(`connect_eror due to ${err.message}`);
    });
  }

  sendChoice(choice) {
    this.io.sockets.emit('choice', choice);
  }
}


function room(io) {
  io.on('connection', (socket) => {
    new Connection(io, socket);
    console.log("Socket.io connection");
  });
};

module.exports = room;
