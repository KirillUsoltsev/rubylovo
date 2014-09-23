function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var Player = function(game, num, kind){
  var self = this;

  self.position = 0;
  self.num = num;
  self.kind = kind;
  self.game = game;
  self.element = $("#player" + self.num);

  if (self.num == 1){
    $(document.body).on("keyup", function(e){
      if (e.which == 81 || e.which == 87){ // q
        self.step();
      }
    });
  }

  self.step = function(){
    self._incrementPosition();
    self._animateCharacter();
    self._checkWin();
  }

  self._incrementPosition = function(){
    self.position = self.position + 1;
  }

  self._animateCharacter = function(){
    self.element.width("" + self.position + "%");
  }

  self._checkWin = function(){
    if (self.position == 100){
      self.game.setWinner(self);
    }
  }
}

var Game = function(){
  var self = this;

  self.player1 = null;
  self.player2 = null;
  self.winnerNumber = null;

  self.start = function(){
    self._showScreen("start");

    $(document.body).on("keyup", function(e){
      if (e.which == 32){
        self.showPlayers();
      }
    });
  }

  self.showPlayers = function(){
    self._showScreen("players");

    var next = function(){
      self._setupRandomPlayers();
      self.showRace();
    }

    setTimeout(next, 2000);
  }

  self.showRace = function(){
    self._showScreen("race");
  }

  self.showResult = function(){
    self._showScreen("result");
    $("#result").text("player" + self.winner().num + " wins");
  }

  self.setWinner = function(num){
    if (self.winnerNumber == null){
      self.winnerNumber = num;
      self.showResult();
    }
  }

  self.winner = function(){
    if (self.winnerNumber == 1){
      return self.player1;
    } else {
      return self.player2;
    }
  }

  self._showScreen = function(id){
    $(".screen").hide();
    $("#" + id).show();
  }

  self._setupRandomPlayers = function(){
    var player1 = getRandomInt(0, 4);
    var player2 = null;
    while (!player2 || (player1 == player2)){
      player2 = getRandomInt(0, 4);
    }

    self.player1 = new Player(self, 1, player1);
    self.player2 = new Player(self, 2, player2);
  }
}

$(function(){
  var el = document.createElement("div"),
      docEl = document.documentElement;
  el.innerText = "Click to start";
  el.id = "fullscreen"
  document.body.appendChild(el)

  el.onclick = function() {
    docEl.webkitRequestFullscreen();
    document.body.removeChild(el);

    var game = new Game();
    game.start();
  };
});
