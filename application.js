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
  self.shot = 1;

  if (self.num == 1){
    $(document.body).on("keyup", function(e){
      if (e.which == 81 || e.which == 87){ // q
        self.step();
      }
    });
  }

  setInterval(function(){
    self.element.removeClass(function(index, css){
      return (css.match (/(^|\s)frame-\S+/g) || []).join(" ");
    });
    self.shot += 1;
    if (self.shot > 16){
      self.shot = 1;
    }
    self.element.addClass("frame-" + self.shot);
  }, 64);

  self.step = function(){
    self._incrementPosition();
    self._animateCharacter();
    self._checkWin();
  }

  self.heroName = function(){
    return ["", "AARON", "SANDI", "BOZHIDAR", "ERIK", "JONAS"][self.kind];
  }

  self._incrementPosition = function(){
    self.position = self.position + 1;
  }

  self._animateCharacter = function(){
    self.element.css("left", "" + (self.position * 1000 / 1760.0) + "%");
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

    var timeout = self._setupRandomPlayers();
    setTimeout(function(){
      self.showStarting();
    }, timeout + 2000);
  }

  self.showStarting = function(){
    var screen = $("#starting");

    screen.find(".player-1").text(self.player1.heroName());
    screen.find(".player-2").text(self.player2.heroName());

    self._showScreen("starting");

    setTimeout(function(){
      screen.addClass("starting-3");
    }, 2000);

    setTimeout(function(){
      screen.addClass("starting-2");
      screen.removeClass("starting-3");
    }, 3000);

    setTimeout(function(){
      screen.addClass("starting-1");
      screen.removeClass("starting-2");
    }, 4000);

    setTimeout(function(){
      screen.addClass("starting-go");
    }, 5000);

    setTimeout(function(){
      self.showRace();
      screen.removeClass();
    }, 5200);
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

    // console.log(player1, player2);

    self.player1 = new Player(self, 1, player1 + 1);
    self.player2 = new Player(self, 2, player2 + 1);

    console.log([self.player1.kind, self.player2.kind])

    $(".hero-" + self.player1.kind).addClass("selecting").addClass("player-1");
    setTimeout(function(){
      $(".hero-" + self.player1.kind).addClass("selected").
        removeClass("selecting");
    }, 200);

    $(".hero-" + self.player2.kind).addClass("selecting").addClass("player-2");
    setTimeout(function(){
      $(".hero-" + self.player2.kind).addClass("selected").
        removeClass("selecting");
    }, 200);

    return 400;

    // var setSelecting = function(num, heroNum){
    //   $(".hero").removeClass("selecting").removeClass("player-" + num);
    //   var hero = $(".hero-" + heroNum);
    //   hero.addClass("selecting")
    //   if (!hero.hasClass("selected")){
    //     hero.addClass("player-" + num);
    //   }
    // }
    //
    // var setPlayer = function(num){
    //   $(".hero.player-" + num).addClass("selected").removeClass("selecting");
    // }
    //
    // // selecting player-1
    // _(player1Position).times(function(n){
    //   var heroNum = n % 5 + 1;
    //   setTimeout(function(){
    //     setSelecting(1, heroNum)
    //   }, timeout * n);
    // });
    //
    // // select player-1
    // setTimeout(function(){
    //   setPlayer(1);
    // }, timeout * (player1Position - 1));
    //
    // var offset = timeout * player1Position + 400;
    //
    // // selecting player-2
    // _(player2Position).times(function(n){
    //   var heroNum = n % 5 + 1;
    //   setTimeout(function(){
    //     setSelecting(2, heroNum)
    //   }, offset + timeout * n);
    // });
    //
    // // select player-2
    // setTimeout(function(){
    //   setPlayer(2);
    // }, offset + timeout * (player2Position - 1) + 400);
    //
    // return offset + timeout * (player2Position - 1) + 400;
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
