const socket = io();

const roomIDNotification = document.getElementById('roomIDNotification');
const playerJoinNotification = document.getElementById('playerJoinNotification');
const createJoinGame = document.getElementById('createJoinGame');
const controls = document.getElementById('controls');

/*
const rockButton = document.getElementById('rock-button');
const paperButton = document.getElementById('paper-button');
const scissorsButton= document.getElementById('scissors-button');
*/

controls.style.display = 'none';
roomIDNotification.style.display = 'none';
playerJoinNotification.style.display = 'none';

var roomID = null;

function createGame() {
  const playerName = 'Anon';
  console.log('create_game');
  socket.emit('createGame', {name:playerName});
}

function joinGame() {
  const playerName = 'Anon';
  roomID = prompt("Enter room #");
  if (roomID != null) {
    socket.emit('joinGame', {name:playerName}, roomID);
  }
}
 
function leaveGame() {
  const playerName = 'Anon';
  createJoinGame.style.display = 'block';
  controls.style.display = 'none';
  roomIDNotification.style.display = 'none';
  playerJoinNotification.style.display = 'none';
  console.log('Current Room ID is ' + roomID);
  socket.emit('leaveGame', {name:playerName}, roomID);
}

socket.on('newGame', (data) => {
  console.log('Heard back from server, created room with ID ' + data.roomID);
  roomID = data.roomID;
  roomIDNotification.style.display = 'block';
  document.querySelector('#roomIDNotification').innerText = 'Game created with room ID ' + data.roomID;
});

socket.on('playerJoin', (name) => {
  console.log(name + " joined room");
  document.querySelector('#playerJoinNotification').innerText = name + " joined room, ready to make choice"; 
  createJoinGame.style.display = 'none';
  playerJoinNotification.style.display = 'block';
  controls.style.display = 'block';
});

socket.on('noRoom', () => {
  const playerName = 'Anon';
  console.log('No room found');
  roomID = prompt("No room was found with that ID - try Again");
  if (roomID != null) {
    socket.emit('joinGame', {name:playerName}, roomID);
  } 
});
