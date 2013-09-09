var Game = function() {
  this.player = $("#author");
  this.speed = 25;
  this.topPos = 0;
  this.leftPos = $(window).width() / 2 - this.player.width() / 2;

  this.nav_show_pos = this.y_center = $(window).height() / 2 - this.player.height() / 2;
  this.info_show_pos1 = this.nav_show_pos + this.player.height() * 4;
  this.info_show_pos2 = this.info_show_pos1 + this.speed;
  this.info_hide_pos = this.info_show_pos2 + this.player.height() * 4;

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
      this.nav_show_pos = this.y_center = $(window).height() / 2 - player.height() / 2;
      this.info_show_pos1 = this.nav_show_pos + player.height() * 4;
      this.info_show_pos2 = this.info_show_pos1 + this.speed;
      this.info_hide_pos = this.info_show_pos2 + player.height() * 4;
    });

    $('.road, .bridge').unbind('click').bind('click', function(e) {
      var x = e.pageX - player.width() / 2;
      var y = e.pageY;
      var canMove = me.canImove(x, y, true);
      if (canMove === true) {
        me.teleport(x, y);
        me.openDoors(x, y);
        me.revealMenu(y);
      } else {
        me.showNotificationsBar(notifications[0]);
      }
    });

    $('.sea').unbind('click').bind('click', function() {
      me.showNotificationsBar(notifications[3]);
    });

    $('.house').unbind('click').bind('click', function() {
      var target = '#' + $(this).attr('id');
      me.moveDirectToHouse(target);
    });

    $('nav a').click(function(e) {
      e.preventDefault();
      var target = $(this).attr('href');
      if (target == '#boat') {
        $('nav a').removeClass('current');
        $(this).addClass('current');
        me.shipSail();
        return;
      } else if (target == '#startCave') {
        $('nav a').removeClass('current');
        $(this).addClass('current');
        $('html, body').animate({scrollTop: 0}, 'slow');
        me.teleport($(window).width() / 2 - me.player.width() / 2, 100);
        return;
      } else if (target == '#howToPlay') {
        me.lightboxInit(target, false);
        return;
      }
      // the rest are houses
      me.moveDirectToHouse(target);
    });

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
            me.shipSail();
          }
        break;

        case 27: // esc
          me.hideNotificationBar();
        break;
      }
      me.openDoors(me.leftPos, me.topPos);
      me.revealMenu(me.topPos);
    }).keyup(function() {
      if (player.attr('class') != '') {
        player.removeAttr('class').destroy();
      }
    });

    $('#boat').unbind('click').bind('click', function() {
      $('nav a').removeClass('current');
      $('nav a[href="#boat"]').addClass('current');
      me.shipSail();
    });

    $("#notifications").find('.close').on('click', function() {
      me.hideNotificationBar();
    });

    $(document).on('click', "#dark, #closeLB", function() {
      me.closeLightbox();
    });
  },

  showNotificationsBar: function(notification) {
    var me = this;
    $("#notifications").css('bottom', 0);
    if (!$("#notifications").find('.inner').attr('id') ||
        $("#notifications").find('.inner').text() != notification.text) {
      $("#notifications").find('.inner').attr('id', notification.type)
         .fadeOut('fast', function() {
        $(this).html('<img src="' + notification.img + '" />' +
           notification.text).fadeIn('fast');
      });
    }
  },

  hideNotificationBar: function() {
    $("#notifications").css('bottom', '-60px');
  },

  revealMenu: function(y) {
    if (y >= this.nav_show_pos) {
      $('nav').addClass('show');
      if (y >= this.info_show_pos1 && y < this.info_show_pos2) {
        this.showNotificationsBar(notifications[1]);
      } else if (y > this.info_hide_pos &&
          $("#notifications").find('.inner').text() == notifications[1].text) {
        this.hideNotificationBar();
      }
    } else {
      $('nav').removeClass('show');
    }
  },

  teleport: function(x, y) {
    this.topPos = y;
    this.leftPos = x;
    var player = this.player;
    var y_center = this.y_center;
    player.css({
      opacity: 0,
      top: y,
      left: x
    }).show().stop(true, true).animate({opacity: 1});

    if (this.topPos >= y_center) {
      $('html, body').animate({scrollTop: y - y_center}, 'slow');
    }
    this.shipBack();
  },

  moveDirectToHouse: function(target) {
    var house;
    for (i = 0; i < houses.length; i++) {
      if (houses[i].id == target) {
        house = houses[i];
        break;
      }
    }
    var y = house.top + house.height - 30;
    var x;
    if (house.left && house.left != null) {
      x = house.left + house.door.left;
    } else {
      // calculate the x pos in front of the door for house on the right
      x = $(window).width() - house.width - house.right + house.door.left;
    }
    var canMove = this.canImove(x, y, true);
    if (canMove) {
      this.topPos = y;
      this.leftPos = x;
      this.teleport(x, y);
      this.openDoors(x, y);
    }
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
    var y_center = this.y_center;
    var canMove = this.canImove(null, y);
    if (canMove) {
      if (this.topPos >= y_center) {
        if (dir == 'up') {
          $('html, body').animate(
              {scrollTop: $(document).scrollTop() - speed}, 5);
        } else {
          $('html, body').animate({scrollTop: y - y_center}, 5);
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

  openDoors: function(x, y) {
    var player = this.player;
    var elmLeft = x || this.leftPos;
    var elmTop = y || this.topPos;
    for (i = 0; i < houses.length; i++) {
      if (houses[i].left && houses[i].left != null) {
        if (elmTop >= houses[i].top + houses[i].height - 80 &&
            elmTop < houses[i].top + houses[i].height + player.height() &&
            elmLeft < houses[i].left + houses[i].width) {
          $(houses[i].id).find(".door").addClass('open');
        } else {
          $(houses[i].id).find(".door").removeClass('open');
        }
      } else if (houses[i].right && houses[i].right != null) {
        if (elmTop >= houses[i].top + houses[i].height - 80 &&
            elmTop < houses[i].top + houses[i].height + player.height() &&
            elmLeft > $(window).width() - houses[i].right - houses[i].width) {
          $(houses[i].id).find(".door").addClass('open');
        } else {
          $(houses[i].id).find(".door").removeClass('open');
        }
      } else {
        $(".door").removeClass('open');
      }
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

  shipSail: function() {
    $('html, body').animate({
      scrollTop: $("#wrapper").height() - $("endSea").height() + 20});
    var ship = $('#boat');
    this.hideNotificationBar();
    // stop the current running animation on the matched elements
    // clearQueue: A boolean indicating whether to remove queued animation as
    //             well. Defaults to false
    // jumpToEnd: A boolean indicating whether to complete the current animation
    //            immediately. Defaults to false
    this.player.stop(true, true).fadeOut('fast');
    ship.find('.meSail').delay(500).fadeIn('fast');
    ship.removeAttr('class').addClass('sail');
    $("#contact").addClass('show');
  },

  shipBack: function() {
    var ship = $('#boat');
    if (!ship.hasClass('isMoored')) {
      ship.removeClass('sail');
      ship.find('.meSail').hide();
      $("#contact").removeClass('show');
    } else {
      return;
    }
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
