function gameLogic(state) {
  var outcome = {
    winner : { socket : null, name : "", choice : '' },
    loser  : { socket : null, name : "", choice : '' },
    draw   : false
  }

  if (state.p1.choice == 'rock') {
    if (state.p2.choice == 'rock') {
      outcome.draw = true;
      outcome.winner = state.p1;
      outcome.loser  = state.p2;
    } else if (state.p2.choice == 'paper') {
      outcome.winner = state.p2;
      outcome.loser  = state.p1;
    } else if (state.p2.choice == 'scissors') {
      outcome.winner = state.p1;
      outcome.loser  = state.p2;
   } else {
      console.log("p2 no choice");
    }
  } else if (state.p1.choice == 'paper') {
    if (state.p2.choice == 'rock') {
      outcome.winner = state.p1;
      outcome.loser  = state.p2;
    } else if (state.p2.choice == 'paper') {
      outcome.draw = true;
      outcome.winner = state.p1;
      outcome.loser  = state.p2;
    } else if (state.p2.choice == 'scissors') {
      outcome.winner = state.p2;
      outcome.loser  = state.p1;
    } else {
      console.log("p2 no choice");
    }
  } else if (state.p1.choice == 'scissors') {
    if (state.p2.choice == 'rock') {
      outcome.winner = state.p2;
      outcome.loser  = state.p1;
    } else if (state.p2.choice == 'paper') {
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

  return outcome;
} 

module.exports = gameLogic;
