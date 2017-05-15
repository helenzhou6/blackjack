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
    //   number: 10,
    //   suit: 2,
    // }, {
    //   number: 10,
    //   suit: 3,
    // }];
    // dealer.cards = [{
    //   number: 2,
    //   suit: 2,
    // }, {
    //   number: 3,
    //   suit: 3,
    // }];
    player.score = score(player.cards);
    ui(player);
    ui(dealer);
    drawCard(player, 2);
    drawCard(dealer, 1, true);
    drawCard(dealer, 1, false);
    
    // Checks for split game
    if (player.cards[0].number === player.cards[1].number || player.cards[0].number > 9 && player.cards[1].number > 9) {
      $('.split').removeClass('is-hidden');
      $('.player__choice').addClass('is-hidden');
    }

    // Checks for natural wins (passive)
    if (dealer.score === 21 && player.score !== 21) {
      player.result = "Tough luck, dealer got blackjack.";
      player.gameResult = 'lost';
      endGame();
      $('.secondHand').addClass('is-hidden');
    } else if (player.score === 21 && dealer.score !== 21) {
      player.result = "What a natural. You win.";
      player.gameResult = 'won';
      endGame();
      $('.secondHand').addClass('is-hidden');
    } else if (player.score === 21 && dealer.score === 21) {
      player.result = "Say what, you both got blackjack.";
      player.gameResult = 'drew';
      endGame();
      $('.secondHand').addClass('is-hidden');
    }
  }

  // restart();

  // GAME PLAY
  // Draws a card, then updates score and UI
  function drawCard(type, number = 1, isHidden = false){
    for (i = 0; i < number; i++) {
      var randomCard = removesRanCard(deck);
      randomCard.isHidden = isHidden;
      type.cards.push(randomCard);
    }
    type.score = score(type.cards);

    if (!isHidden){
      ui(type);
    }
  }

  // Dealer plays
  function dealerPlays(){
    while (dealer.score < 17) {
      drawCard(dealer, 1, true);
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
      playerType.result = `You went bust.`;
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
      playerType.result = 'You drew';
      playerType.gameResult = 'drew';
    } else if (playerType.score > 21 && dealer.score < 22 || dealer.score > playerType.score && dealer.score < 22) {
      playerType.result = 'You lost';
      playerType.gameResult = 'lost';
    } else {
      playerType.result = 'You won!';
      playerType.gameResult = 'won';
    }
  };

  //SPLIT GAME -- but only allows one split rather than the maximum of three splits
  // When player agrees to split game
  function splitGame(){

    // If two aces
    if (player.cards[0].number === 1) {
      secondHand.cards.push(player.cards[0]);
      player.cards.shift();
      drawCard(player);
      drawCard(secondHand);
      if (player.score < 21 && secondHand.score < 21){
        dealerPlays();
      }
      updateResult(player);
      updateResult(secondHand);
      endGame();

    // Otherwise splits the game into two rounds
    } else {
      isFirstRound = true;
      $('.secondHand__choice').removeClass('is-hidden');
      $(".player").addClass('is-inactive');
      secondHand.cards.push(player.cards[0]);
      player.cards.shift();
      player.score = score(player.cards);
      drawCard(secondHand);
      secondHand.score = score(secondHand.cards);
      if (secondHand.score === 21){
        updateResult(secondHand);
        toSecondRound();
      }
      ui(player);
    }
  }

  // Transfers from first hand/round to second hand/round
  function toSecondRound(){
    isFirstRound = false;
    $('.player__choice').removeClass('is-hidden');
    $('.secondHand__choice').addClass("is-hidden");
    $('.secondHand').addClass('is-inactive');
    $('.player').removeClass('is-inactive');
    drawCard(player);
    if (player.score === 21){
      updateResult(player);
      endGame();
    }
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

 // Restart the game UI
  $('.deal__button').click(function(e){
    e.preventDefault();
    $('.split, .secondHand, .deal__button, .player__result, .secondHand__result, .notification, .secondHand__choice').addClass('is-hidden');
    $('.player__choice, .player').removeClass('is-hidden');
    $('.player, .secondHand').removeClass('is-inactive');
    $('.player .player__stats h2').html("Player");
    $('.dealer__score > .score__number').html('<span class="charac-push">?<span>');
    restart();
  });

  $('.reset').click(function(e){
    e.preventDefault();
    $('.split, .secondHand, .deal__button, .player__result, .secondHand__result, .notification, .secondHand__choice').addClass('is-hidden');
    $('.player__choice, .player').removeClass('is-hidden');
    $('.player, .secondHand').removeClass('is-inactive');
    $('.player .player__stats h2').html("Player");
    $('.dealer__score > .score__number').html('<span class="charac-push">?<span>');
    $('.deal').removeClass('is-hidden');
    $('.hit, .stand').addClass('is-hidden');
    $('.player__score > .score__number').html('<span class="charac-push">?<span>');
    $('.dealer__cards, .player__cards').html(`
          <div class='card-wrapper'>
              <div class='card card--placeholder'></div>
          </div>
          <div class='card-wrapper'>
              <div class='card card--placeholder'></div>
          </div>
        `);
  });

  $('.deal').click(function(e){
    e.preventDefault();
    $('.hit, .stand').removeClass('is-hidden');
    $(this).addClass('is-hidden');
    restart();
  });


  $('.player__choice .hit').click(function(e){
    e.preventDefault();
    hit(player);
  });

  $('.secondHand__choice .hit').click(function(e){
    e.preventDefault();
    hit(secondHand);
  });

  $('.split-button-no').click(function(e){
      e.preventDefault();
      $('.split').addClass('is-hidden');
      $('.player__choice').removeClass('is-hidden');
  });

  $('.split-button-yes').click(function(e){
      e.preventDefault();
      $('.split').addClass('is-hidden');
      splitGame();
      $(".secondHand").removeClass('is-hidden');
      $('.player .player__stats h2').html("2<sup>nd</sup>_hand");
  });

  $('.reset').click(function(e){
      e.preventDefault();
      tally = {
        player: 0,
        dealer: 0,
      }
      $('.dealer__tally').html(tally.dealer);
      $('.player__tally').html(tally.player);
  });

  // Generates HTML
  function ui(person){
      // $(`.${person.type}_score > .score_score`).remove();

    var cardUI = '';

    for (i = 0; i < person.cards.length; i++) {
      var icon = 0;
      if (person.cards[i].number === 11) {
        icon = 'J';
      } else if (person.cards[i].number === 12) {
        icon = 'Q';
      } else if (person.cards[i].number === 13) {
        icon = 'K';
      } else if (person.cards[i].number === 1) {
        icon = 'A';
      } else {
        icon = person.cards[i].number;
      }

      var suit;
      if (person.cards[i].suit === 1) {
        suit = 'spade';
      } else if (person.cards[i].suit === 2) {
        suit = 'heart';
      } else if (person.cards[i].suit === 3) {
        suit = 'diamond';
      } else if (person.cards[i].suit === 4) {
        suit = 'club';
      }

      if (person.type === 'dealer' && i === 0 && dealer.cards[0].isHidden){
        cardUI += `
        <div class='card-wrapper' data-index="1">
            <div class='card card--back ${(suit ? `card--${suit}` : '')}'></div>
          </div>
        `;
       } else if (person.cards[i].isHidden){
        cardUI += `
        <div class='card-wrapper' data-index="${i}">
            <div class='card is-hidden'></div>
        </div>
        `;
       } else {
        cardUI += `
          <div class='card-wrapper' data-index="${i}">
            <div class='card ${(suit ? `card--${suit}` : '')}'>
              <span class="card__number card__number--top">
                ${icon}
              </span>
              <span class="card__number card__number--bottom">
                ${icon}
              </span>
            </div>
          </div>
        `;
      }
    }

    $(`.${person.type}__cards`).html(cardUI);

    if (person.type === 'player' || person.type === 'secondHand') {

      var scoreText = person.score;

      if (person.score < 10) {
        scoreText = `0${scoreText}`;
      }

      $(`.${person.type}__score > .score__number`).html(scoreText);
    }
  };

  // End of game UI
  function dealerRevealsAll(){
    for (i = 0; i < dealer.cards.length; i++) {
      dealer.cards[i].isHidden = false;
    }
    ui(dealer);

    var scoreText = dealer.score;

    if (scoreText < 9) {
        scoreText = `0${scoreText}`;
    }

    $('.dealer__score > .score__number').html(scoreText);
  }

  function endGame(){
      $('.player, .secondHand').removeClass('is-inactive');
      $('.player__choice, .split').addClass('is-hidden');
      $('.deal__button').removeClass('is-hidden');
      $('.dealer__cards .card').css({'display': 'block'});
      
      var notification = '';;
      if(secondHand.result) {
        if(secondHand.gameResult === player.gameResult) {
          notification = `You ${secondHand.gameResult} the 1st & 2nd hand.`;
        } else {
          notification = `You ${secondHand.gameResult} the 1st hand & ${player.gameResult} the 2nd hand.`;
        }
      } else {
        notification = player.result;
      }
      $('.notification').html(notification).removeClass('is-hidden');

      $('.player__result').html(player.result).removeClass('is-hidden');
      $('.secondHand__choice').addClass('is-hidden');
      $('.secondHand__result').html(secondHand.result).removeClass('is-hidden');
      dealerRevealsAll();
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
      $('.dealer__tally').html(tally.dealer);
      $('.player__tally').html(tally.player);
  }
    $('.heading__subtext, .heading__title, .heading__close, .modal__close').click(function(e){
      e.preventDefault();
      $('.modal, .heading__close, .reset-two').toggleClass('is-hidden');
      $('.notification').addClass('is-hidden');
      $('.heading, .footer').toggleClass('textColor');
      $('body').toggleClass('is-unscrollable');
      // window.scrollTo(0,0);
    });

      
});
