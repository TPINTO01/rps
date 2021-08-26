const randomstring = require
const uuidv4 = require('uuid').v4;

const players = {};

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;


    socket.on('createRoom', (playerName) => this.createRoom(playerName));
    socket.on('joinRoom', (playerName, roomID) => this.joinRoom(playerName, roomID));
    socket.on('leaveRoom', (playerName, roomID) => this.leaveRoom(playerName, roomID));
    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      console.log(`connect_eror due to ${err.message}`);
    });
  }


  // Event functions

  createRoom(playerName) {
    const roomID = uuidv4();
    players[roomID] = [playerName];
    this.socket.join(roomID);
    this.io.sockets.to(roomID).emit('newRoom', roomID);    
  }
  
  joinRoom(playerName, roomID) {
    var message;
    if (roomID in players) { 
      if (players[roomID].length < 2) {
        players[roomID].push(playerName);
        this.socket.join(roomID);
        this.io.sockets.to(roomID).emit('playerJoin', playerName, roomID);
      } else {
        this.sendUniqueClient('failToJoin', "Room is full");
      } 
    } else {
      this.sendUniqueClient('failToJoin', "Room not found");
    }
  }

  leaveRoom(playerName, roomID) {
    const index = players[roomID].indexOf(playerName);
    if (index > -1) {
      players[roomID].splice(index, 1);
      if (players[roomID].length == 0) {
        delete players[roomID];
      }
    }
    this.socket.leave(roomID);
    this.io.sockets.to(roomID).emit('playerLeave', playerName);
  }

  disconnect() {
    console.log('Client disconnected');
  }


  // Private functions 
  
  sendUniqueClient(eventName, message) {
    const uniqueRoom = uuidv4();
    this.socket.join(uniqueRoom)
    this.io.sockets.to(uniqueRoom).emit(eventName, message);
    this.socket.leave(uniqueRoom); 
  }

}


function game(io) {
  io.on('connection', (socket) => {
    new Connection(io, socket);
    console.log("Socket.io connection");
  });
};

module.exports = game;
