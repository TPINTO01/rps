const createID = require('./utils/createID');
const gameLogic = require('./utils/gameLogic');

const players = {};
const rooms   = {};


class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;


    socket.on('createRoom', (playerName) => this.createRoom(playerName));
    socket.on('joinRoom', (playerName, roomID) => this.joinRoom(playerName, roomID));
    socket.on('leaveRoom', (playerName, roomID) => this.leaveRoom(playerName, roomID));
    socket.on('choice', (choice, roomID) => this.choice(choice, roomID));
    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      console.log(`connect_eror due to ${err.message}`);
    });
  }



  createRoom(playerName) {
    const roomID = createID(6);
    players[roomID] = [{socket : this.socket.id, name : playerName, choice : ""}];
    rooms[this.socket.id] = roomID;

    this.socket.join(roomID);
    this.io.sockets.to(roomID).emit('newRoom', roomID);    
  }


  joinRoom(playerName, roomID) { 
    if (roomID in players) { 
      if (players[roomID].length < 2) {
        players[roomID].push({socket : this.socket.id, name : playerName, choice : ""});
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


  choice(choice, roomID) {
    const index = players[roomID].map(function (player) { 
      return player.socket; 
    }).indexOf(this.socket.id);

    var opponentIndex = -1;
    if (index) {
      opponentIndex = 0; 
    } else {
      opponentIndex = 1;
    }

    players[roomID][index].choice = choice;
    console.log( players[roomID][index].name + " chose " + players[roomID][index].choice );

    if ( players[roomID][opponentIndex].choice != '' ) {
      const state = { p1 : { socket : players[roomID][0].socket,
                           name   : players[roomID][0].name,
                           choice : players[roomID][0].choice },
                    p2 : { socket : players[roomID][1].socket,
                           name   : players[roomID][1].name,
                           choice : players[roomID][1].choice }
      }

      const outcome = gameLogic(state);
      console.log(outcome);

      this.io.sockets.to(roomID).emit('result', outcome); 
    }
   

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


function game(io) {
  io.on('connection', (socket) => {
    new Connection(io, socket);
    console.log("Socket.io connection");
  });
};

module.exports = game;
