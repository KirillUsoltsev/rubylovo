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
  self.lastStep = null;
  self.num = num;
  self.kind = kind;
  self.game = game;
  self.element = $("#player" + self.num);
  self.shot = 1;
  self.startAt = null;
  self.endAt = null;

  self.element.addClass("hero-" + self.kind);

  if (self.num == 1){
    $(document.body).on("keyup", function(e){
      if (e.which == 81 || e.which == 87){ // q
        self.step();
      }
    });
  }

  if (self.num == 2){
    $(document.body).on("keyup", function(e){
      if (e.which == 79 || e.which == 80){
        self.step();
      }
    });
  }

  self.animation = setInterval(function(){
    self.element.removeClass(function(index, css){
      return (css.match (/(^|\s)frame-\S+/g) || []).join(" ");
    });
    self.shot += 1;
    if (self.shot > 16){
      self.shot = 1;
    }
    if (self.game.state == "race"){
      self.element.addClass("frame-" + self.shot);
    }
  }, 48);

  self.play = function(left, right){
    if ((left && right) || (!left && !right)){
      return false;
    }

    if ((left && self.lastStep != "left") || (right && self.lastStep != "right")){
      self.step();
    }

    if (left) {
      self.lastStep = "left"
    } else {
      self.lastStep = "right"
    }
  }

  self.step = function(){
    if (!self.startAt){
      self.startAt = new Date();
    }
    self._incrementPosition();
    self._animateCharacter();
    self._checkWin();
  }

  self.recordsman = function(){
    var raw = localStorage.getItem("hero-" + self.kind);
    var current = JSON.parse(raw);

    if (self.raceTime() < current.time){
      return true;
    } else {
      return false;
    }
  }

  self.raceTime = function(){
    return self.endAt - self.startAt;
  }

  self.saveRecord = function(id){
    var data = {
      id: "#" + id,
      time: self.raceTime(),
      hero: self.heroName()
    }
    localStorage.setItem("hero-" + self.kind, JSON.stringify(data));
  }

  self.heroName = function(){
    return ["", "AARON", "SANDI", "BOZHIDAR", "ERIK", "JONAS"][self.kind];
  }

  self._incrementPosition = function(){
    self.position = self.position + 1;
  }

  self._animateCharacter = function(){
    self.element.css("left", "" + (1540.0 * self.position / 100) + "px");
  }

  self._checkWin = function(){
    if (self.position == 100){
      self.endAt = new Date();
      self.game.setWinner(self);
    }
  }
}

var Game = function(){
  var self = this;

  self.player1 = null;
  self.player2 = null;
  self.winnerNumber = null;
  self.state = null;

  self.play = function(data){
    if (self.state == "race"){
      self.player1.play(data[1], data[0]);
      self.player2.play(data[3], data[2]);
    } else if (self.state == "leaderboard"){
      // if (data[0] && data[1] && data[2] && data[3]){
      //   $(document.body).off("keyup");
      //   self.start();
      // }
    }
  }

  self.start = function(){
    self.state = "start";
    self._showScreen("start");

    self._setMusic("race-" + _.random(1, 4));

    self._cleanup();

    setTimeout(function(){
      self.showPlayers();
    }, 2000);
  }

  self._cleanup = function(){
    self.winnerNumber = null;
    self.player1 = null;
    self.player2 = null;
    $("#player1").css("left", 0);
    $("#player2").css("left", 0);
    $("#player1").removeClass().addClass("player");
    $("#player2").removeClass().addClass("player");
    $("#result").removeClass().addClass("screen");
    $("#record input").val("");
  }

  self.showPlayers = function(){
    self.state = "players";
    self._showScreen("players");

    var timeout = self._setupRandomPlayers();
    setTimeout(function(){
      self.showStarting();
    }, timeout + 2000);
  }

  self.showStarting = function(){
    self.state = "starting";
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
      screen.removeClass().addClass("screen");
    }, 5200);
  }

  self.showRace = function(){
    self.state = "race";
    self._showScreen("race");
  }

  self.showResult = function(){
    self.state = "result";
    self._showScreen("result");
    $("#result").addClass("winner-" + self.winner().kind);

    self._setMusic("result-" + _.random(1, 3));

    if (self.winner().recordsman()){
      setTimeout(function(){
        self.showRecord();
      }, 3000);
    } else {
      setTimeout(function(){
        self.showLeaderboard();
      }, 4000);
    }
  }

  self.showRecord = function(){
    self.state = "record";
    self._showScreen("record");

    var input = $("#record input");
    input.focus();
    $("#record input").on("keyup", function(e){
      if (e.which == 13){
        if (input.val().length > 0){
          self.winner().saveRecord(input.val());
          input.off("keyup");

          setTimeout(function(){
            self.showLeaderboard();
          }, 200);
        }
      }
    });
  }

  self.setWinner = function(player){
    if (self.winnerNumber == null){
      self.winnerNumber = player.num;
      self.showResult();

      clearInterval(self.player1.animation);
      clearInterval(self.player2.animation);
    }
  }

  self.winner = function(){
    if (self.winnerNumber == 1){
      return self.player1;
    } else {
      return self.player2;
    }
  }

  self.showLeaderboard = function(){
    self.state = "leaderboard";
    self._showScreen("leaderboard");

    var results = [];
    for (var key in localStorage){
      results.push(localStorage.getItem(key));
    }

    results = _(results).sortBy(function(item){
      return JSON.parse(item).time;
    });

    $.each(results, function(i, raw){
      var item = JSON.parse(raw);
      var html = $("#leaderboard .row")[i];
      $(html).find(".hero").text(item.hero);
      $(html).find(".player").text(item.id);
    });

    $(document.body).on("keyup", function(e){
      if (e.which == 32){
        $(document.body).off("keyup");
        self.start();
      }
    });
  }

  self._setMusic = function(track){
    if (self.music){
      self.music.pause();
    }

    self.music = new Audio("audio/" + track + ".mp3");
    self.music.loop = true;
    self.music.play();
  }

  self._showScreen = function(id){
    $(".screen").hide();
    $("#" + id).show();
  }

  self._setupRandomPlayers = function(){
    var player1;
    var player2;
    var p1;
    var p2;
    var tmpArray;
    var i = 0;

    while ((i <= 6) && !player1 && !player2){
      if (i < 6){
        setTimeout(function(){
          tmpArray = _([1,2,3,4,5]).shuffle();
          p1 = tmpArray.pop();
          p2 = tmpArray.pop();
          $(".hero").removeClass("player-1").removeClass("player-2").
            removeClass("selecting");
          $(".hero-" + p1).addClass("player-1").addClass("selecting");
          setTimeout(function(){
            $(".hero-" + p2).addClass("player-2").addClass("selecting");
          }, 200);
        }, i * 800);
      } else {
        setTimeout(function(){
          tmpArray = _([1,2,3,4,5]).shuffle();
          p1 = tmpArray.pop();
          p2 = tmpArray.pop();
          $(".hero").removeClass("player-1").removeClass("player-2").
            removeClass("selecting");
          tmpArray = _([1,2,3,4,5]).shuffle();

          player1 = p1;
          player2 = p2;

          $(".hero-" + p1).addClass("player-1").addClass("selected");
          $(".hero-" + p2).addClass("player-2").addClass("selected");

          self.player1 = new Player(self, 1, player1);
          self.player2 = new Player(self, 2, player2);

          setTimeout(function(){
            $(".hero").removeClass("player-1").removeClass("player-2").
              removeClass("selected").removeClass("selecting");
          }, 10000)
        }, i * 800);
      }

      i = i + 1;
    }

    return 6 * 800 + 1000;
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

    var ws = new WebSocket("ws://0.0.0.0:1666")
    ws.onmessage = function(e) {
      var data = JSON.parse(e.data)
      game.play(data);
    }
    ws.onerror = function(e) {
      console.log(e)
    }
  };

  _.range(1, 6).forEach(function(i){
    if (!localStorage.getItem("hero-" + i)){
      var defaultData = {
        id: "",
        time: 1000000000000,
        hero: ["", "AARON", "SANDI", "BOZHIDAR", "ERIK", "JONAS"][i]
      }
      localStorage.setItem("hero-" + i, JSON.stringify(defaultData));
    }
  })
});
