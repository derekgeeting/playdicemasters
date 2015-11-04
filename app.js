angular.module('dm',['ngDraggable','ui.bootstrap','LocalStorageModule']).controller('dmController', ['$rootScope', '$scope', '$timeout', 'localStorageService', function($rootScope, $scope, $timeout, localStorageService) {
  //necessary crap to fix bug in ngDraggable
  $rootScope.$on('draggable:end', function(a,b) {
    if(b) {
      b.uid = 2435234;
    }
  });

  $scope.cards = cards;
  $scope.basicActions = _.where(cards, {"subname": "Basic Action Card"});
  
  var defaultDecks = {
    opponent: {
      cards: [{set:'avx', number:2, numDice:4}, {set:'avx', number:129, numDice:4}, {set:'avx', number:130, numDice:4},
              {set:'avx', number:67, numDice:3}, {set:'avx', number:74, numDice:2}, {set:'avx', number:99, numDice:1},
              {set:'avx', number:39, numDice:2}, {set:'avx', number:47, numDice:1} ],
      actions: [{set:'avx', number:25}, {set:'avx', number:27}]
    },
    me: {
      cards: [{set:'avx', number:1, numDice:4}, {set:'avx', number:123, numDice:4}, {set:'avx', number:131, numDice:4},
              {set:'avx', number:62, numDice:3}, {set:'avx', number:79, numDice:2}, {set:'avx', number:93, numDice:1},
              {set:'avx', number:38, numDice:2}, {set:'avx', number:42, numDice:1} ],
      actions: [{set:'avx', number:29}, {set:'avx', number:31}]
    }
  };

  $scope.initBuildMode = function() {
    $scope.selectedOpponentDeck = $scope.selectedOpponentDeck || defaultDecks.opponent;
    $scope.selectedMyDeck = $scope.selectedMyDeck || defaultDecks.me;

    $scope.editingOpponentDeck = {
      cards: [],
      actions: [],
    }
    $scope.editingMyDeck = {
      cards: [],
      actions: [],
    }

    $scope.mode = 'build';
  }

  // $rootScope.$watch('activeIdx', function() {
  //   console.log('activeIdx changed', arguments);
  // });
  
  $scope.incrementDice = function(deckItem, amount) {
    if( deckItem.numDice+amount<=5 && deckItem.numDice+amount>0 ) {
      deckItem.numDice += amount;
      $scope.saveDecks();
    }
  }

  $scope.selectCardDuringEdit = function(selectedCard, bucket, editingBucket, index) {
    bucket[index] = bucket[index] || {};
    bucket[index].set = selectedCard.set;
    bucket[index].number = selectedCard.number;
    delete bucket[index].editing;
    editingBucket[index] = null;
    $scope.saveDecks();
  }

  $scope.saveDecks = function() {
    $scope.savedDecks.opponent = $scope.selectedOpponentDeck;
    $scope.savedDecks.me = $scope.selectedMyDeck;
    localStorageService.set('decks', $scope.savedDecks);
  }

  $scope.initPlayMode = function() {
    // $scope.selectedOpponentDeck = $scope.selectedOpponentDeck || defaultDecks.opponent;
    // $scope.selectedMyDeck = $scope.selectedMyDeck || defaultDecks.me;

    $scope.opponentDeck = [];
    $scope.basicActions = [];
    $scope.myDeck = [];

    var i, deckItem;
    for( i=0; i<$scope.selectedOpponentDeck.cards.length; i++ ) {
      deckItem = $scope.selectedOpponentDeck.cards[i];
      $scope.opponentDeck.push({
        card:_.findWhere(cards,{set:deckItem.set, number:deckItem.number}),
        numDice:deckItem.numDice,
        origNumDice:deckItem.numDice,
        zone:$scope.opponentDeck
      });
    }

    for( i=0; i<$scope.selectedMyDeck.cards.length; i++ ) {
      deckItem = $scope.selectedMyDeck.cards[i];
      $scope.myDeck.push({
        card:_.findWhere(cards,{set:deckItem.set, number:deckItem.number}),
        numDice:deckItem.numDice,
        origNumDice:deckItem.numDice,
        zone:$scope.myDeck
      });
    }

    var allBasicActions = ($scope.selectedMyDeck.actions||[]).concat($scope.selectedOpponentDeck.actions||[]);
    for( i=0; i<allBasicActions.length; i++ ) {
      deckItem = allBasicActions[i];
      $scope.basicActions.push({
        card:_.findWhere(cards,{set:deckItem.set, number:deckItem.number}),
        numDice: 3,
        origNumDice: 3,
        color:['Blue','Pnk','Yellow','Red'][i],
        zone:$scope.basicActions
      });
    }

    $scope.myLife = 20;
    $scope.opponentLife = 20;

    $scope.zones = {
      myAttack:[], myUsed:[], myField:[], myReserve:[], myPrep:[], myTransition:[], myBag: [],
      opponentAttack:[], opponentUsed:[], opponentField:[], opponentReserve:[], opponentPrep:[], opponentTransition:[], opponentBag: [],
      rollArea:[]
    };
    for( i=0; i<8; i++ ) {$scope.zones.opponentBag.push(getNewSidekickDie($scope.zones.opponentBag));}
    for( i=0; i<8; i++ ) {$scope.zones.myBag.push(getNewSidekickDie($scope.zones.myBag));}

    $scope.mode = 'play';
  }

  $scope.reset = function() {
    if($scope.mode=='play') {
      $scope.initPlayMode();
    } else if(mode=='initBuildMode') {
      $scope.initBuildMode();
    }
  }

  var init = function() {
    $scope.savedDecks = localStorageService.get('decks') || {};
    $scope.selectedOpponentDeck = $scope.savedDecks.opponent || defaultDecks.opponent;
    $scope.selectedMyDeck = $scope.savedDecks.me || defaultDecks.me;
    $scope.initPlayMode();
  }

  var getNewSidekickDie = function(zone) {
    return {
      sidekick: true,
      side: 0,
      images: ['images/sidekickC.png', 'images/sidekickB.png', 'images/sidekickS.png', 'images/sidekickF.png', 'images/sidekickM.png', 'images/sidekickQ.png'],
      cardImage:'images/sidekickFull.jpg',
      zone: zone
    }
  }

  var rollD6 = function() {
    return Math.floor(Math.random()*6);
  }

  var getDieFromDeckItem = function(deckItem, zone) {
    var c = {
      side: 5,
      images: [],
      cardImage: 'images/'+deckItem.card.set+'/cards/'+deckItem.card.number+'.jpg',
      zone: zone,
      card: deckItem.card
    };
    for( var i=1; i<=6; i++ ) {
      if(deckItem.color) {
        if(i<=3) { c.images.push('images/BasicAction'+deckItem.color+'1-3.png'); }
        else     { c.images.push('images/BasicAction'+deckItem.color+i+'.png');  }
      } else {
        if(i==2||i==3) { c.images.push('images/'+deckItem.card.set+'/dice/'+deckItem.card.name+'2-3.png'); }
        else           { c.images.push('images/'+deckItem.card.set+'/dice/'+deckItem.card.name+i+'.png'); }
      }
    }
    return c;
  }

  $scope.showCard = function(card) {
    $scope.shownCard = card;
  }

  $scope.onDropComplete = function(droppedItem, droppedZone) {
    //if coming from a bag, we should always randomize the actual die removed
    if(droppedItem.zone===$scope.zones.opponentBag || droppedItem.zone===$scope.zones.myBag) {
      droppedItem = droppedItem.zone[Math.floor(Math.random()*droppedItem.zone.length)];
      droppedItem.side = rollD6();
    }

    //need to handle returns to deck differently
    if(droppedZone===$scope.opponentDeck || droppedZone===$scope.myDeck || droppedZone===$scope.basicActions) {
      if(droppedItem.zone===$scope.opponentDeck || droppedItem.zone===$scope.myDeck || droppedItem.zone===$scope.basicActions) {
        return; //don't allow moving from deck to deck
      }
      //make sure the die actually belongs to this deck
      if(droppedItem.sidekick) { return }
      var foundCard = _.findWhere(droppedZone, {card:droppedItem.card});
      if( !foundCard ) { return }
      foundCard.numDice++;
      //remove die from old zone
      if(droppedItem.zone && droppedItem.zone.indexOf(droppedItem)>=0) {
        droppedItem.zone.splice(droppedItem.zone.indexOf(droppedItem),1);
      }
      return;
    }

    //if coming from the deck, need to create a die
    if(droppedItem.zone===$scope.opponentDeck || droppedItem.zone===$scope.myDeck || droppedItem.zone===$scope.basicActions) {
      var newDie = getDieFromDeckItem(droppedItem, droppedZone);
      droppedItem.numDice--;
      droppedItem = newDie;
    }
    //remove die from old zone
    if(droppedItem.zone && droppedItem.zone.indexOf(droppedItem)>=0) {
      droppedItem.zone.splice(droppedItem.zone.indexOf(droppedItem),1);
    }
    droppedZone.push(droppedItem);
    droppedItem.zone = droppedZone;
  }

  $scope.rollAll = function() {
    $scope.zones.rollArea.forEach( function(die) {
      die.spinning = true;
      $timeout(function() {
        die.spinning = false;
        die.side = rollD6();
      },800);
    });
  }

  $scope.moveAll = function(fromZone, toZone) {
    for( var i=fromZone.length-1; i>=0; i-- ) {
      $scope.onDropComplete(fromZone[i], toZone);
    }
  }

  $scope.help = function() {
    alert('coming soon');
  }

  init();
}]);