var Game = function() {
  this.player = $("#author");
  this.speed = 25;
  this.topPos = 0;
  this.leftPos = $(window).width() / 2 - this.player.width() / 2;
  this.init();
}

Game.constructor = Game;

Game.prototype = {
  init: function() {
    // center the player relative to the window width;
    this.player.css('left', this.leftPos + 'px');

    // add an event handler
    this.eventsHandler();

    // how to play lightbox
    this.howToPlay();

    $('nav a:first').addClass('current');
  },

  howToPlay: function() {
    var isFirstTime = localStorage.getItem('isYourFirstTime');
    if (!isFirstTime) {
      this.lightboxInit('#howToPlay', false);
      localStorage.setItem('isYourFirstTime', false);
    }
  },

  eventsHandler: function() {
    var me = this;
    var player = this.player;

    $(window).resize(function() {
      player.css('left', $(window).width() / 2 - player.width() / 2 + 'px');
    });

    // TODO

    $(window).unbind('keydown').bind('keydown', function(event) {
      if (me.topPos > parseFloat($('#startText').css('top'))) {
        $('#startText').fadeOut('fast', function() {
          $(this).remove();
        });
      }
      switch (event.keyCode) {
        case 37: // left
          me.moveX(me.leftPos - me.speed, 'left');
          event.preventDefault();
        break;

        case 39: // right
          me.moveX(me.leftPos + me.speed, 'right');
          event.preventDefault();
        break;

        case 38: // up
          me.moveY(me.topPos - me.speed, 'up');
          event.preventDefault();
        break;

        case 40: // down
          me.moveY(me.topPos + me.speed, 'down');
          event.preventDefault();
        break;

        case 13: // enter
          if (me.topPos > $('#wrapper').height() - $('#endSea').height() -
              player.height()) {
            $('nav a').removeClass('current');
            $('nav a[href="#boat"]').addClass('current');
            me.shipSail(); // TODO
          }
        break;

        case 27: // esc
          me.hideNotificationBar(); // TODO
        break;
      }
      // TODO
    }).keyup(function() {
      if (player.attr('class') != '') {
        player.removeAttr('class').destroy();
      }
    });
    // TODO
    $(document).on('click', "#dark, #closeLB", function() {
      me.closeLightbox();
    });
  },

  moveX: function(x, dir) {
    var player = this.player;
    var canMove = this.canImove(x, null);
    if (canMove) {
      this.leftPos = x;
      player.animate({'left': x + 'px'}, 10);
    }
    if (dir == 'left') {
      this.startMoving('left', 2);
    } else {
      this.startMoving('right', 3);
    }
  },

  moveY: function(y, dir) {
    var player = this.player;
    var speed = this.speed;
    var canMove = this.canImove(null, y);
    if (canMove) {
      if (this.topPos >= 200) {
        if (dir == 'up') {
          $('html, body').animate({scrollTop: $(document).scrollTop() - speed}, 5);
        } else {
          $('html, body').animate({scrollTop: $(document).scrollTop() + speed}, 5);
        }
      }
      this.topPos = y;
      player.animate({'top': y + 'px'}, 10);
    }
    if (dir == 'up') {
      this.startMoving('up', 4);
    } else {
      this.startMoving('down', 1);
    }
  },
  startMoving: function(dir, state) {
    var player = this.player;
    if (!player.hasClass(dir)) {
      player.addClass(dir);
      player.sprite({fps: 9, no_of_frames: 3}).spState(state);
    }
  },

  canImove: function(moveLeft, moveTop, teleported) {
    var player = this.player;
    var elmLeft = moveLeft || this.leftPos;
    var elmTop = moveTop || this.topPos;

    if (player.css('display') == 'none' && !teleported) {
      return false;
    }

    // TODO
    return true;
  },

  // #howToPlay, false
  lightboxInit: function(elm, effectMenu) {
    var me = this;
    if ($("#dark").length < 1) {
      if (effectMenu) {
        alert('TODO');
      }
      // get the relevant content
      var content = $(elm).find('.lightbox').html();

      // create the lightbox
      $('<div id="dark"></div>').appendTo('body').fadeIn();
      $('<div id="lightbox">' + content + '<span id="closeLB">x</span></div>')
          .insertAfter('#dark').delay(1000).fadeIn();

      $(window).unbind('keydown');
      $('#wrapper').unbind('click');

      $(window).bind('keydown', function(e) {
        if (e.keyCode == 27) {
          me.closeLightbox();
        }
      });
    }
  },

  closeLightbox: function() {
    var me = this;
    $('#dark, #lightbox').fadeOut('fast', function() {
      var canMove = me.canImove(me.leftPos, me.topPos + 80);
      if (canMove) {
        me.startMoving('down', 1);
        me.player.animate({'top': me.topPos + 80}, function() {
          me.player.removeAttr('class').destroy();
        });
        me.topPos = me.topPos + 80;
      }
      $('#dark, #lightbox').remove();
      me.eventsHandler();
      $('html, body').animate({scrollTop: me.topPos - 270});
    });
  }
}
