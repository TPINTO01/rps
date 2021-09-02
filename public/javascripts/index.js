const socket = io();


const roomStatus= document.getElementById('roomStatus');
const playerStatus = document.getElementById('playerStatus');
const createJoinGame = document.getElementById('createJoinGame');
const controls = document.getElementById('controls');
const choiceStatus = document.getElementById('choiceStatus');
const outcomeContainer = document.getElementById('outcomeContainer');
const leaveRoomButton = document.getElementById('leaveRoomButton');
const playAgainButton = document.getElementById('playAgainButton');
const rematchStatus = document.getElementById('rematchStatus');
const rematchButton = document.getElementById('rematchButton');
const score = document.getElementById('score');
const gameContainer = document.getElementById('gameContainer');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');

controls.style.display         = 'none';
roomStatus.style.display       = 'none';
playerStatus.style.display     = 'none';
leaveRoomButton.style.display  = 'none';
choiceStatus.style.display     = 'none';
outcomeContainer.style.display = 'none';
rematchStatus.style.display    = 'none';
rematchButton.style.display    = 'none';
score.style.display            = 'none';
playAgainButton.style.display  = 'none';


var roomID  = null;


// Events

socket.on('newRoom', (room) => {
  roomID = room;

  document.querySelector('#roomStatus').innerText = "Room ID : " + room;
  document.querySelector('#playerStatus').innerText = "Waiting for player";

  createJoinGame.style.display  = 'none';
  roomStatus.style.display      = 'block';
  playerStatus.style.display    = 'block';
  leaveRoomButton.style.display = 'block'; 
}); 

socket.on('playerJoin', (playerName, room) => {
  document.querySelector('#roomStatus').innerText = "Room ID: " + room; 
  document.querySelector('#playerStatus').innerText = playerName + " joined room"; 


  createJoinGame.style.display  = 'none';
  roomStatus.style.display      = 'block';
  playerStatus.style.display    = 'block';
  leaveRoomButton.style.display = 'block';
  controls.style.display        = 'block';
  gameContainer.style.display   = 'block';
  chatContainer.style.display   = 'inline';
});

socket.on('playerLeave', (name) => {
  document.querySelector('#playerStatus').innerText = name + " left room, waiting for player";

  choiceStatus.style.display      = 'none';
  controls.style.display          = 'none';
  outcomeContainer.style.display  = 'none';
  rematchStatus.style.display     = 'none';
  rematchButton.style.display     = 'none';
  score.style.display             = 'none';
  gameContainer.style.display     = 'none';
  playAgainButton.style.display   = 'none';
  chatContainer.style.display     = 'none';

  deleteMessages();
});

socket.on('failToJoin', (message) => {
  const playerName = 'Anon';
  roomID = prompt(message);
  if (roomID != null) {
    socket.emit('joinGame', playerName, roomID);
  } 
});

socket.on('outcome', (outcome) => { 
  var opponentChoiceText = "";
  var opponentScoreText  = "";
  var myScoreText        = "";
  var resultText         = "";

  if (outcome.draw) {
    if (outcome.winner.socket == socket.id) {
      opponentChoiceText = outcome.loser.name  + " chose " + outcome.loser.choice;
      opponentScoreText  = outcome.loser.name  + " : " + outcome.loser.score;
      myScoreText        = outcome.winner.name + " : " + outcome.winner.score;
    } else { 
      opponentChoiceText = outcome.winner.name + " chose " + outcome.winner.choice;
      opponentScoreText  = outcome.winner.name + " : " + outcome.winner.score;
      myScoreText        = outcome.loser.name  + " : " + outcome.loser.score; 
    }
    resultText = "Draw";
  } else if (outcome.winner.socket == socket.id) {
    opponentChoiceText = outcome.loser.name  + " chose " + outcome.loser.choice;
    opponentScoreText  = outcome.loser.name  + " : " + outcome.loser.score;
    myScoreText        = outcome.winner.name + " : " + outcome.winner.score;
    resultText = "You win";
  } else {
    opponentChoiceText = outcome.winner.name + " chose " + outcome.winner.choice;
    opponentScoreText  = outcome.winner.name + " : " + outcome.winner.score;
    myScoreText        = outcome.loser.name  + " : " + outcome.loser.score;
 
    resultText = "You lose";
  }

  document.querySelector('#opponentChoice').innerText = opponentChoiceText;
  document.querySelector('#result').innerText         = resultText;
  document.querySelector('#opponentScore').innerText  = opponentScoreText;
  document.querySelector('#myScore').innerText        = myScoreText;

  choiceStatus.style.display     = 'none';
  outcomeContainer.style.display = 'block'; 
  playAgainButton.style.display  = 'block';
  score.style.display            = 'block';
});

socket.on('rematchRequest', (name) => {
  document.querySelector('#rematchStatus').innerText = name + " requests a rematch";

  playAgainButton.style.display = 'none';
  rematchStatus.style.display   = 'block';
  rematchButton.style.display   = 'block';
});

socket.on('rematch', () => {
  rematchStatus.style.display   = 'none';
  rematchButton.style.display   = 'none';
  controls.style.display        = 'block';
});



// Chatbox

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let msg = e.target.elements.msg.value

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  socket.emit('chatMessage', 'anon', roomID, msg);

  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

socket.on('message', (message) => {
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
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

function choose(choice) {
  controls.style.display     = 'none';
  choiceStatus.style.display = 'block';

  socket.emit('choice', choice, roomID);
}

function playAgain() {
  document.querySelector('#rematchStatus').innerText = "Waiting for rematch accept";

  outcomeContainer.style.display = 'none';
  playAgainButton.style.display  = 'none';
  rematchStatus.style.display    = 'block';

  socket.emit('requestRematch', roomID);
}

function acceptRematch() {
  rematchStatus.style.display    = 'none';
  rematchButton.style.display    = 'none';
  outcomeContainer.style.display = 'none';

  socket.emit('acceptRematch', roomID);
}
 
function leaveGame() {
  controls.style.display         = 'none';
  roomStatus.style.display       = 'none';
  playerStatus.style.display     = 'none';
  leaveRoomButton.style.display  = 'none';
  outcomeContainer.style.display = 'none';
  rematchStatus.style.display    = 'none';
  rematchButton.style.display    = 'none';
  choiceStatus.style.display     = 'none';
  score.style.display            = 'none';
  gameContainer.style.display    = 'none';
  playAgainButton.style.display  = 'none';
  chatContainer.style.display    = 'none';
  createJoinGame.style.display   = 'block';

  deleteMessages();
  const playerName = 'Anon';
  socket.emit('leaveRoom', playerName, roomID);
}

// Output message to DOM
function outputMessage(message) {
  console.log(message);
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('#chatMessages').appendChild(div);
}

function deleteMessages() {
  messages = chatMessages.getElementsByTagName('*');
  
  var i, e;
  for (i = messages.length - 1; i >= 0; --i) {
    messages[i].remove();
  }
}
