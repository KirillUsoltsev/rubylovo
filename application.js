function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(o){
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

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

    self._setupRandomPlayers();
    // self.showRace();
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
    var variants = [0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4];
    var array = shuffle(variants);
    var player1Position = getRandomInt(10, 19);
    var player2Position = getRandomInt(10, 19);
    var player1 = array[player1Position];
    var player2 = array[player2Position];
    var timeout = 200;

    while(player1 == player2){
      player2Position = getRandomInt(10, 19);
      player2 = array[player2Position];
    }

    self.player1 = new Player(self, 1, player1);
    self.player2 = new Player(self, 2, player2);

    var setSelecting = function(num, heroNum){
      $(".hero").removeClass("selecting").removeClass("player-" + num);
      var hero = $(".hero-" + heroNum);
      hero.addClass("selecting")
      if (!hero.hasClass("selected")){
        hero.addClass("player-" + num);
      }
    }

    var setPlayer = function(num){
      $(".hero.player-" + num).addClass("selected").removeClass("selecting");
    }

    // selecting player-1
    _(player1Position).times(function(n){
      var heroNum = n % 5 + 1;
      setTimeout(function(){
        setSelecting(1, heroNum)
      }, timeout * n);
    });

    // select player-1
    setTimeout(function(){
      setPlayer(1);
    }, timeout * (player1Position - 1));

    var offset = timeout * player1Position;

    // selecting player-2
    _(player2Position).times(function(n){
      var heroNum = n % 5 + 1;
      setTimeout(function(){
        setSelecting(2, heroNum)
      }, offset + timeout * n);
    });

    // select player-2
    setTimeout(function(){
      setPlayer(2);
    }, offset + timeout * (player2Position - 1));
  }
}

$(function(){
  // var el = document.createElement("div"),
  //     docEl = document.documentElement;
  // el.innerText = "Click to start";
  // el.id = "fullscreen"
  // document.body.appendChild(el)
  //
  // el.onclick = function() {
  //   docEl.webkitRequestFullscreen();
  //   document.body.removeChild(el);
  //
    var game = new Game();
    game.start();
  // };
});
