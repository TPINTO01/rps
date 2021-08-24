const randomstring = require
const uuidv4 = require('uuid').v4;

const players = {};

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;


    socket.on('createGame', (data) => this.createGame(data));
    socket.on('joinGame', (data, roomID) => this.joinGame(data, roomID));
    socket.on('leaveGame', (data, roomID) => this.leaveGame(data, roomID));
    socket.on('disconnect', () => this.disconnect());

    /*
    socket.on('connect_error', (err) => {
      console.log(`connect_eror due to ${err.message}`);
    });

    */
  }

  createGame(data) {
    const roomID = uuidv4();
    this.socket.join(roomID);
    players[roomID] = [data.name];
    console.log('Game created in room ' + roomID);
    this.io.sockets.to(roomID).emit('newGame', {roomID:roomID});    
    console.log(players[roomID]);
  }
  
  joinGame(data, roomID) {
    if (roomID in players) {
      this.socket.join(roomID);
      players[roomID].push(data.name);
      console.log('Anon joined room ' + roomID);
      console.log(roomID);
      console.log(players[roomID]);
      this.io.sockets.to(roomID).emit('playerJoin', data.name);
    } else {
      console.log('request to join room DNE');

      const noRoom = uuidv4();
      this.socket.join(noRoom)
      this.io.sockets.to(noRoom).emit('noRoom');
      this.socket.leave(noRoom);
    }
  }

  leaveGame(data, roomID) {
    const index = players[roomID].indexOf(data.name);
    this.socket.leave(roomID);
    if (index > -1) {
      players[roomID].splice(index, 1);
    }
  }

  disconnect() {
    console.log('Client disconnected');
  }

}


function game(io) {
  io.on('connection', (socket) => {
    new Connection(io, socket);
    console.log("Socket.io connection");
  });
};

module.exports = game;
