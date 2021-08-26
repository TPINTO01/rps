const socket = io();


const roomStatus= document.getElementById('roomStatus');
const playerStatus = document.getElementById('playerStatus');
const createJoinGame = document.getElementById('createJoinGame');
const controls = document.getElementById('controls');
const leaveRoomButton = document.getElementById('leaveRoomButton');


controls.style.display        = 'none';
roomStatus.style.display      = 'none';
playerStatus.style.display    = 'none';
leaveRoomButton.style.display = 'none';


var roomID = null;


// Events

socket.on('newRoom', (room) => {
  createJoinGame.style.display  = 'none';
  roomStatus.style.display      = 'block';
  playerStatus.style.display    = 'block';
  leaveRoomButton.style.display = 'block';

  roomID = room;
  document.querySelector('#roomStatus').innerText = "Room ID : " + room;
  document.querySelector('#playerStatus').innerText = "Waiting for player";
});

socket.on('playerJoin', (playerName, room) => {
  createJoinGame.style.display  = 'none';
  roomStatus.style.display      = 'block';
  playerStatus.style.display    = 'block';
  leaveRoomButton.style.display = 'block';
  controls.style.display        = 'block';

  document.querySelector('#roomStatus').innerText = "Room ID: " + room; 
  document.querySelector('#playerStatus').innerText = playerName + " joined room, ready to make choice"; 
});

socket.on('playerLeave', (playerName) => {
  document.querySelector('#playerStatus').innerText = playerName + " left room, waiting for player";
  controls.style.display = 'none';
});

socket.on('failToJoin', (message) => {
  const playerName = 'Anon';
  roomID = prompt(message);
  if (roomID != null) {
    socket.emit('joinGame', playerName, roomID);
  } 
});


// Functions

function createGame() {
  const playerName = 'Anon';
  socket.emit('createRoom', playerName);
}

function joinGame() {
  const playerName = 'Anon';
  roomID = prompt("Enter room #");
  if (roomID != null) {
    socket.emit('joinRoom', playerName, roomID);
  }
}
 
function leaveGame() {
  createJoinGame.style.display  = 'block';
  controls.style.display        = 'none';
  roomStatus.style.display      = 'none';
  playerStatus.style.display    = 'none';
  leaveRoomButton.style.display = 'none';

  const playerName = 'Anon';
  socket.emit('leaveRoom', playerName, roomID);
}
