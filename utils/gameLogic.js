function gameLogic(state) {
  var outcome = {
    winner : { socket : null, name : "", choice : '', score : null },
    loser  : { socket : null, name : "", choice : '', score : null },
    draw   : false
  }

  if (state.p1.choice == 'rock') {
    if (state.p2.choice == 'rock') {
      outcome.draw = true;
      outcome.winner = state.p1;
      outcome.loser  = state.p2;
    } else if (state.p2.choice == 'paper') {
      state.p2.score = state.p2.score + 1;
      outcome.winner = state.p2;
      outcome.loser  = state.p1;
    } else if (state.p2.choice == 'scissors') {
      state.p1.score = state.p1.score + 1;
      outcome.winner = state.p1;
      outcome.loser  = state.p2;
   } else {
      console.log("p2 no choice");
    }
  } else if (state.p1.choice == 'paper') {
    if (state.p2.choice == 'rock') {
      state.p1.score = state.p1.score + 1;
      outcome.winner = state.p1;
      outcome.loser  = state.p2;
    } else if (state.p2.choice == 'paper') {
      outcome.draw = true;
      outcome.winner = state.p1;
      outcome.loser  = state.p2;
    } else if (state.p2.choice == 'scissors') {
      state.p2.score = state.p2.score + 1;
      outcome.winner = state.p2;
      outcome.loser  = state.p1;
    } else {
      console.log("p2 no choice");
    }
  } else if (state.p1.choice == 'scissors') {
    if (state.p2.choice == 'rock') {
      state.p2.score = state.p2.score + 1;
      outcome.winner = state.p2;
      outcome.loser  = state.p1;
    } else if (state.p2.choice == 'paper') {
      state.p1.score = state.p1.score + 1;
      outcome.winner = state.p1;
      outcome.loser  = state.p2;
    } else if (state.p2.choice == 'scissors') {
      outcome.draw = true;
      outcome.winner = state.p1;
      outcome.loser  = state.p2;
    } else {
      console.log("p2 no choice");
    }
  } else {
    console.log("p1 no choice");
  }

  console.log(state);

  return outcome;
} 

module.exports = gameLogic;
