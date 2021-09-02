const moment = require('moment');
const createID = require('./utils/createID');
const gameLogic = require('./utils/gameLogic');
const formatMessage  = require('./utils/messages');

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
    socket.on('requestRematch', (roomID) => this.requestRematch(roomID));
    socket.on('acceptRematch', (roomID) => this.acceptRematch(roomID));

    socket.on('chatMessage', (name, roomID, msg) => this.chatMessage(name, roomID, msg));

    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      console.log(`connect_eror due to ${err.message}`);
    });
  }



  createRoom(playerName) {
    const roomID = createID(6);
    players[roomID] = [{socket : this.socket.id, 
                        name   : playerName, 
                        choice : "", 
                        score : 0}];
    rooms[this.socket.id] = roomID;

    this.socket.join(roomID);
    this.io.sockets.to(roomID).emit('newRoom', roomID);    
  }


  joinRoom(playerName, roomID) { 
    if (roomID in players) { 
      if (players[roomID].length < 2) {
        players[roomID].push({socket : this.socket.id, 
                              name   : playerName, 
                              choice : "", 
                              score : 0});
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
      } else {
        players[roomID][0].choice = '';
        players[roomID][0].score  = 0;
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
    index ? opponentIndex = 0 : opponentIndex = 1;

    players[roomID][index].choice = choice;

    if ( players[roomID][opponentIndex].choice != '' ) {
      var state = { p1 : { socket : players[roomID][0].socket,
                           name   : players[roomID][0].name,
                           choice : players[roomID][0].choice,
                           score  : players[roomID][0].score  },
                    p2 : { socket : players[roomID][1].socket,
                           name   : players[roomID][1].name,
                           choice : players[roomID][1].choice,
                           score  : players[roomID][1].score  } }

      const outcome = gameLogic(state);

      players[roomID][0].score = state.p1.score;
      players[roomID][1].score = state.p2.score;

      this.io.sockets.to(roomID).emit('outcome', outcome); 
    }
   
  }

  requestRematch(roomID) {
    const index = players[roomID].map(function (player) { 
      return player.socket; 
    }).indexOf(this.socket.id);

    var opponentIndex = -1;
    index ? opponentIndex = 0 : opponentIndex = 1;

    this.io.sockets.to(players[roomID][opponentIndex].socket).emit('rematchRequest', 
                                                                  players[roomID][index].name);
  }


  acceptRematch(roomID) {
    players[roomID][0].choice = '';
    players[roomID][1].choice = '';
    this.io.sockets.to(roomID).emit('rematch');
  }


  chatMessage(name, roomID, msg) { 
    const message = {
      text : msg,
      username : name,
      time : moment().format('h:mm a')
    }
    this.io.sockets.to(roomID).emit('message', formatMessage(message.username + ' ', msg, message.time));

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
          players[roomID][0].choice = '';
          players[roomID][0].score  = 0;
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
