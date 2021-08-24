const randomstring = require
const uuidv4 = require('uuid').v4;

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;
    this.players = {};

    socket.on('create-game', (data) => this.createGame(data));
    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      console.log(`connect_eror due to ${err.message}`);
    });
  }

  createGame(data) {
    const roomID=randomstring.generate({length: 4});
    this.io.sockets.join(roomID);
    players[roomID]=data.name;
    this.io.sockets.emit('newGame', {roomID:roomID});    
  }

}


function game(io) {
  io.on('connection', (socket) => {
    new Connection(io, socket);
    console.log("Socket.io connection");
  });
};

module.exports = game;
