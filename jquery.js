$(document).ready(function () {

  // TO DO: six decks and half the deck

  // ESSENTIAL GAME PLAY
  // Generates a new deck
  function newDeck(){
    var deck = [];
    var i,
        number,
        suit;
    for (i = 0; i < 52; i++){
      suit = i%4 + 1; 
      number = i%13 + 1;
      deck.push({suit, number});
    }
    return deck;
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
    
    if (hasAce && (score + 10 < 22)) {
        score += 10;
    }
    return score;
  }

  // GLOBAL VARIABLES
  var deck = [];

  // var players = {
    
  // };


  // var playerProto = {
  //   type: '',
  //   cards: [],
  //   score: 0,
  //   result: 'nope',
  // };

  // function Player(type) {
  //   this.type = type | undefined;
  //   this.cards = [];
  //   this.score = 0;
  //   this.result = 'nope';

  //   this.hit = function() {

  //   };
  // };

  // var player = new Player();


  // var player = Object.assign({}, Object.create(playerProto), {
  //   type: 'player',
  // });

  // var player = newPlayer();

  // function newPlayer(type) {
  //   return Object.assign({}, Object.create(playerProto), {
  //     type: 'player',
  //   });
  // }

  var tally = {
    player: 0,
    dealer: 0,
  }

  var dealer = {
    type: 'dealer',
    cards: [],
    score: 0,
  };

  var player = {
    type: 'player',
    cards: [],
    score: 0,
    result: undefined,
    gameResult: undefined,
  };

  var secondHand = {
    type: 'secondHand',
    cards: [],
    score: 0,
    result: undefined,
    gameResult: undefined,
  };

  var isFirstRound = false;

  // (RE)STARTS THE GAME
  function restart(){ 
    // Maximum number of cards possible for each hand is 11?? Check!!
    if (deck.length < 22) {
      deck = newDeck();
    }
    isFirstRound = false;
    dealer.score = 0;
    dealer.cards = [];
    player.score = 0;
    player.cards = [];
    player.result = undefined;
    player.gameResult = undefined;
    secondHand.score = 0;
    secondHand.cards= [];
    secondHand.result = undefined;
    secondHand.gameResult = undefined;
    // player.cards = [{
    //   number: 3,
    //   suit: 2,
    // }, {
    //   number: 3,
    //   suit: 3,
    // }];
    // player.score = score(player.cards);
    // ui(player);
    drawCard(player, 2);
    drawCard(dealer, 2);
    
    // Checks for split game
    if (player.cards[0].number === player.cards[1].number) {
      $('.split').removeClass('is-hidden');
      $('.player_choice').addClass('is-hidden');
    }

    // Checks for natural wins (passive)
    if (dealer.score === 21 && player.score !== 21) {
      player.result = "The dealer got a natural win";
      player.gameResult = 'lost';
      endGame();
      $('.secondHand').addClass('is-hidden');
    } else if (player.score === 21 && dealer.score !== 21) {
      player.result = "What a natural. You win.";
      player.gameResult = 'won';
      endGame();
      $('.secondHand').addClass('is-hidden');
    } else if (player.score === 21 && dealer.score === 21) {
      player.result = "You drew - you both got a natural win";
      player.gameResult = 'drew';
      endGame();
      $('.secondHand').addClass('is-hidden');
    }
  }

  restart();

  // GAME PLAY
  // Draws a card, then updates score and UI
  function drawCard(type, number = 1){
    for (i = 0; i < number; i++) {
      type.cards.push(removesRanCard(deck));
    }
    type.score = score(type.cards);
    ui(type);
  }

  // Dealer plays
  function dealerPlays(){
    while (dealer.score < 17) {
      drawCard(dealer);
    }
    if (isFirstRound) {
      updateResult(secondHand)
    }
    updateResult(player);
  }

  // When player hits
  function hit(playerType) {
    drawCard(playerType);
    
    // Passive check if gone bust
    if (playerType.score > 21) {
      playerType.result = `You got busted!`;
      playerType.gameResult = 'lost';
      if (isFirstRound) {
        toSecondRound();
      } else {
        endGame();
      }
    }

    // Passive check if reached 21 through hits
    else if (playerType.score === 21) {
      dealerPlays();
      updateResult(playerType);
      if (isFirstRound) {
        toSecondRound();
      } else {
        endGame();
      }
    }
  }

  // Updates result
  function updateResult(playerType){
    if (playerType.score === dealer.score) {
      playerType.result = 'you drew';
      playerType.gameResult = 'drew';
    } else if (playerType.score > 21 && dealer.score < 22 || dealer.score > playerType.score && dealer.score < 22) {
      playerType.result = 'you lost';
      playerType.gameResult = 'lost';
    } else {
      playerType.result = 'you won!';
      playerType.gameResult = 'won';
    }
  };

  //SPLIT GAME
  // When player agrees to split game
  function splitGame(){
    isFirstRound = true;

    // If two aces
    if (player.cards[0].number === 1) {
      secondHand.cards.push(player.cards[0]);
      player.cards.shift();
      drawCard(player);
      drawCard(secondHand);
      dealerPlays();
      endGame();

    // Otherwise splits the game into two rounds
    } else {
      $('.secondHand_choice').removeClass('is-hidden');
      secondHand.cards.push(player.cards[0]);
      player.cards.shift();
      player.score = score(player.cards);
      secondHand.score = score(secondHand.cards);
      ui(player);
      ui(secondHand);
    }
  }

  // Transfers from first hand/round to second hand/round
  function toSecondRound(){
    isFirstRound = false;
    $('.player_choice').removeClass('is-hidden');
    $(".secondHand_choice").addClass("is-hidden");
  }

// ON CLICK UI
 $('.stand').click(function(e){
    e.preventDefault();
    dealerPlays();
    if (isFirstRound) {
      toSecondRound();
    } else {
      endGame();
    }
  });

  $('.retry').click(function(e){
    $('.secondHand_choice').addClass('is-hidden');
    $('.player_choice').removeClass('is-hidden');
    $('.player_result').addClass('is-hidden');
    $('.secondHand_result').addClass('is-hidden');
    $('.secondHand').addClass('is-hidden');
    $('.card').remove();
    $('.score').addClass('is-hidden');
    restart();
  });

  $('.player_choice > .hit').click(function(e){
    e.preventDefault();
    hit(player);
  });

  $('.secondHand_choice > .hit').click(function(e){
    e.preventDefault();
    hit(secondHand);
  });

  $('.split-button--no').click(function(e){
      e.preventDefault();
      $('.split').addClass('is-hidden');
      $('.player_choice').removeClass('is-hidden');
  });

  $('.split-button--yes').click(function(e){
      e.preventDefault();
      $('.split').addClass('is-hidden');
      splitGame();
      $(".secondHand").removeClass('is-hidden');
  });

  // Generates HTML
  function ui(person){
      $(`.${person.type}_cards > .card`).remove();
      $(`.${person.type}_score > .score`).remove();
    for (i = 0; i < person.cards.length; i++) { // Store in a variable and then call = one page refresh
        $(`.${person.type}_cards`).append(`
          <div class='card'>
            card number = ${person.cards[i].number}
            suit = ${person.cards[i].suit}
          </div>
      `);
    }
    $(`.${person.type}_score`).append(`
      <span class="score">
       score = ${person.score}
      </span>
    `);
  };

  // End of game UI
  function endGame(){
      $('.player_choice').addClass('is-hidden');
      $('.split').addClass('is-hidden');
      $('.dealer_score > .score').css({'visibility': 'visible'}); //CHANGE THESE CLASSES
      $('.dealer_cards > .card').css({'display': 'block'});
      $('.player_result').html(`${player.result}`).removeClass('is-hidden');
      $('.secondHand_choice').addClass('is-hidden');
      $('.secondHand_result').html(`${secondHand.result}`).removeClass('is-hidden');

      if (player.gameResult === 'won' && (!secondHand.gameResult || secondHand.gameResult === 'drew')) {
        tally.player ++;
      } else if (player.gameResult === 'lost' && (!secondHand.gameResult || secondHand.gameResult === 'drew')) {
        tally.dealer ++;
      } else if (player.gameResult === 'won' && secondHand.gameResult === 'won') {
        tally.player += 2;
      } else if (player.gameResult === 'lost' && secondHand.gameResult === 'lost') {
        tally.dealer += 2;
      } else if (player.gameResult === 'lost' && secondHand.gameResult === 'won' || 
        player.gameResult === 'won' && secondHand.gameResult === 'lost') {
        tally.player ++;
        tally.dealer ++;
      }
      $('.dealer_tally').html(`${tally.dealer}`);
      $('.player_tally').html(`${tally.player}`);
  }

});
