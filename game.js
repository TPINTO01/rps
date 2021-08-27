const players = {};
const rooms   = {};


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
    const roomID = createID(6);
    players[roomID] = [{socket : this.socket.id, name : playerName}];
    rooms[this.socket.id] = roomID;

    this.socket.join(roomID);
    this.io.sockets.to(roomID).emit('newRoom', roomID);    
  }


  joinRoom(playerName, roomID) { 
    if (roomID in players) { 
      if (players[roomID].length < 2) {
        players[roomID].push({socket : this.socket.id, name : playerName});
        rooms[this.socket.id] = roomID;

        this.socket.join(roomID);
        this.io.sockets.to(roomID).emit('playerJoin', playerName, roomID);

      } else {
        this.io.sockets.to(this.socket.id).emit('failToJoin', "Room is full");
      } 
    } else {
      this.io.sockets.to(this.socket.id).emit('failToJoin', "Room not found");
    }
  }


  leaveRoom(playerName, roomID) {
    const index = players[roomID].map(function (player) { 
      return player.socket; 
    }).indexOf(this.socket.id);

    if (index > -1) {
      players[roomID].splice(index, 1);
      if (players[roomID].length == 0) {
        delete players[roomID];
      }
      delete rooms[this.socket.id];
    }
    this.socket.leave(roomID);
    this.io.sockets.to(roomID).emit('playerLeave', playerName);
  }


  disconnect() {
    if (this.socket.id in rooms) {
      const roomID = rooms[this.socket.id]; 
      const index  = players[roomID].map(function (player) { 
        return player.socket; 
      }).indexOf(this.socket.id);

      if (index > -1) {
        const playerName = players[roomID][index].name;
        players[roomID].splice(index, 1);
        if (players[roomID].length == 0) {
          delete players[roomID];
        } else {
          this.io.sockets.to(roomID).emit('playerLeave', playerName);
        }
        delete rooms[this.socket.id];
      }
    } 
  }


}


function createID(length) {  
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function game(io) {
  io.on('connection', (socket) => {
    new Connection(io, socket);
    console.log("Socket.io connection");
  });
};

module.exports = game;
