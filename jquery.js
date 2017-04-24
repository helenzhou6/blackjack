$(document).ready(function () {

  // TO DO: six decks and half the deck and not use the bottom half

  // Generates a new deck
  function newDeck(deck){
    var i,
        number,
        suit;
    for (i=0;i<52;i++){
      suit = i%4+1; 
      number = i%13+1;
      deck.push({suit,number});
    }
  }

  // Returns a random card and removes it from the deck
  function removesRanCard(deck){
    var randomNo = Math.floor(Math.random() * (deck.length));
    return deck.splice(randomNo, 1)[0];
  }

  // Calculates the score
  function score(arrayCards){
    var score = 0;
    
    var hasAce = false;
    for (i = 0; i < arrayCards.length; i++) {
    
      var num = arrayCards[i].number;
      var value = num;
      if (num === 1) {
        hasAce = true;
      }
      if (num > 9){
        value = 10;
      }
      score += value;
    }
    
    if (hasAce === true){
      if (score + 10 < 22) {
        score += 10;
      }
    }
    return score;
  }

  // Global variables
  var deck = [];

  var player = {
    type: 'player',
    cards: [],
    score: 0,
  };
  var dealer = {
    type: 'dealer',
    cards: [],
    score: 0,
  };
  var result = "nope";

  // Starts the game
  function restart(){  
    newDeck(deck); //after each game the deck is reshffled: shouldnt it be when it runs out?  
    //could put player and dealer into a players array and loop over
    dealer.score = 0;
    dealer.cards = [];
    player.score = 0;
    player.cards = [];
    drawCard(player, 2);
    drawCard(dealer, 2); 
    checkNatural();
  }

  restart();

  // Game play
  function drawCard(type, number = 1){
    for (i = 0; i < number; i++) {
      type.cards.push(removesRanCard(deck));
    }
    type.score = score(type.cards);
    ui(type);
  }

  function dealerPlays(){
    while (dealer.score < 17) {
      drawCard(dealer);
      bust(dealer);
    }
    updateResult();
  }

  function hit() {
    drawCard(player);
    bust(player);
    if (player.score === 21) {
      updateResult();
    }
  }

  // Checks for natural wins (passive)
  function checkNatural(){
    if (dealer.score === 21 && player.score !== 21) {
      result = "The dealer got a natural win";
      endGame();
    } else if (player.score === 21 && dealer.score !== 21) {
       result = "What a natural. You win.";
      endGame();
    } else if (player.score === 21 && dealer.score === 21) {
      result = "You drew - you both got a natural win";
      endGame();
    }
  }

  // Checks if gone bust (passive)
  function bust(person){
    if (person.score > 21) {
      result = `.${person.type} went bust!`;
      endGame();
    }
  }

  // Updates result & ends the game
  function updateResult(){
    if (player.score === dealer.score) {
      result = 'you drew';
    } else if (player.score > 21 && dealer.score < 22 || dealer.score > player.score && dealer.score < 22) {
      result = 'you lost';
    } else {
      result = 'you won!';
    }
    endGame();
  };

  // On click UI
  $('.stand').click(function(e){
    e.preventDefault();
    dealerPlays();
  });

  $('.retry').click(function(e){
    $('.hit').removeClass('is-hidden');
    $('.stand').removeClass('is-hidden');
    $('.result').addClass('is-hidden');
    $('.card').remove();
    $('.score').remove();
    restart();
  });

  $('.hit').click(function(e){
    e.preventDefault();
    hit();
  });

  // Generates HTML
  function ui(person){
      $(`.${person.type} > .card`).remove();
      $(`.${person.type} > .score`).remove();
    for (i = 0; i < person.cards.length; i++) {
        $(`.${person.type}`).append(`
          <div class='card'>
            card number = ${person.cards[i].number}
            suit = ${person.cards[i].suit}
          </div>
      `);
    }
    $(`.${person.type}`).append(`
      <div class="${person.type}-score score">
       score = ${person.score}
      </div>
    `);
  };

  // End of game UI
  function endGame(){
      $('.hit').addClass('is-hidden');
      $('.stand').addClass('is-hidden');
      $('.split').addClass('is-hidden');
      $('.dealer-score').css({'visibility': 'visible'});
      $('.dealer > .card').css({'visibility': 'visible'});
      $('.result').html(`${result}`).removeClass('is-hidden');
  }

});
