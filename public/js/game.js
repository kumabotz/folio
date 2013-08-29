var Game = function() {
  // TODO
}

// TODO

Game.prototype = {
  eventsHandler: function() {
    $(window).unbind('keydown').bind('keydown', function(event) {
      switch (event.keyCode) {
        case 37: // move left
          me.moveX(me.leftPos - 5, 'left');
          event.preventDefault();
          break;

        case 39: // move right
          me.moveX(me.leftPos + 5, 'right');
          event.preventDefault();
          break;

        case 38: // move up
          me.moveY(me.topPos - 5, 'up');
          event.preventDefault();
          break;

        case 40: // move down
          me.moveY(me.topPos + 5, 'down');
          event.preventDefault();
          break;
      }
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

  startMoving: function(dir, state) {
    player.addClass(dir);
    player.sprite({fps: 9, no_of_frames: 3}).spState(state);
  },

  lightboxInit: function(elm) {
    // get the relevant content
    var content = $(elm).find('.lightbox').html();

    // create the lightbox
    $('<div id="dark"></div>').appendTo('body').fadeIn();
    $('<div id="lightbox">' + content + '<span id="closeLB">x</span></div>')
        .insertAfter('#dark').delay(1000).fadeIn();
  }
}
