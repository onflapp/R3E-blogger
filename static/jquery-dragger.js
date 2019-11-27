Dragger = {
  GHOST_CLASS:"ghost",
  INSERT_CLASS:"insert",
  SELECTED_CLASS:"selected",
  DRAGGING_CLASS:"dragging",

  FILLER_CLASS:"filler",

  SOURCE:null,
  CONTAINER:null,
  GHOST:null,
  DESTINATION:null,
  DESTINATION_INSERT:null,

  INSERT_BEFORE:null,
  INSERT_AFTER:null,

  EVT_MOVE:"mousemove",
  EVT_DOWN:"mousedown",
  EVT_UP:"mouseup",

  IS_TRACKING: false,

  LOCK_VERTICAL: true,
  FREEHAND_MODE: false,
  USE_GHOST: true,

  ORIGIN_X: 0,
  ORIGIN_Y: 0,

  ORIGIN_DX: 0,
  ORIGIN_DY: 0,

  create_ghost:function(el) {
    var d = Dragger;

    if (d.USE_GHOST) {
      var p = document.createElement("div");
      var rect = el.getBoundingClientRect();

      p.classList.add(d.GHOST_CLASS);
      p.innerHTML = el.outerHTML;
      p.style.position = "absolute";
      p.style.top = rect.y + "px";
      p.style.left = rect.x + "px";
      p.style.width = rect.width + "px";
      p.style.height = rect.height + "px";
      p.style.overflow = "hidden";
      p.style.zIndex = 9999;
      p.style.pointerEvents = "none";
      
      document.body.appendChild(p);

      return p;
    }
    else {
      var rect = el.getBoundingClientRect();
      var p = el;

      p.classList.add(d.GHOST_CLASS);
      p.innerHTML = el.outerHTML;
      p.style.position = "absolute";
      p.style.top = rect.y + "px";
      p.style.left = rect.x + "px";
      p.style.width = rect.width + "px";
      p.style.height = rect.height + "px";
      p.style.overflow = "hidden";
      p.style.pointerEvents = "none";
  
      return el;
    }
  },

  getDragDestination:function(target, dragger) {
    return target;
  },

  getDragSource:function(target, dragger) {
    return target;
  },

  _eventInfo:function(evt) {
    if (evt.targetTouches) {
      var t = evt.targetTouches[0];
      return {
        pageX:t.pageX,
        pageY:t.pageY
      };
    }
    else {
      return {
        pageX:evt.pageX,
        pageY:evt.pageY
      };
    }
  },

  drag_enter:function(evt) {
    var d = Dragger;
    if (d.IS_TRACKING) return;

    d.IS_TRACKING = true;

    var ei = d._eventInfo(evt);

    d.SOURCE = null;

    d.ORIGIN_X = ei.pageX;
    d.ORIGIN_Y= ei.pageY;

    d.ORIGIN_DX = Math.round(ei.pageX);
    d.ORIGIN_DY = Math.round(ei.pageY);

    document.addEventListener('dragover', d.drag_over, false);
    document.addEventListener('drop', d.drop_external, false);
  },

  drag_leave:function(evt) {
    var d = Dragger;
    var ei = d._eventInfo(evt);
    var r = d.CONTAINER.getBoundingClientRect();
    var outside = false;

    if      (ei.pageY < r.top) outside = true;
    else if (ei.pageY > r.top+r.height) outside = true;
    else if (ei.pageX < r.left) outside = true;
    else if (ei.pageX > r.left + r.width) outside = true;

    if (outside) {
      document.removeEventListener('dragover', d.drag_over);
      document.removeEventListener('drop', d.drop_external);
      d.cleanup();
    }
  },

  drop_external:function(evt) {
    var d = Dragger;

    if (d.DESTINATION_INSERT && d.DESTINATION) {
      if (d.DESTINATION_INSERT == d.INSERT_BEFORE) d.droppedExternal(evt.dataTransfer, "before", d.DESTINATION);
      else                                         d.droppedExternal(evt.dataTransfer, "after",  d.DESTINATION);
    }
    d.cleanup();
    if (d.stop) d.stop(evt);

    document.removeEventListener('dragover', d.drag_over);
    document.removeEventListener('drop', d.drop_external);

    evt.stopPropagation();
    evt.preventDefault();
    return false;
  },

  drag_over:function(evt) {
    var d = Dragger;
    d.mouse_move(evt);

    evt.stopPropagation();
    evt.preventDefault();
    return false;
  },

  mouse_down:function(evt) {
    if (evt.button > 0 || evt.ctrlKey) return;

    var d = Dragger;
    var s = d.getDragSource(evt.target, d);

    if (!s) return;
    if (evt.target == d.CONTAINER) return;

    d.SOURCE = s;
    d.IS_TRACKING = false;

    var ei = d._eventInfo(evt);

    d.ORIGIN_X = ei.pageX;
    d.ORIGIN_Y= ei.pageY;

    var off = $(s).offset();
    d.ORIGIN_DX = Math.round(ei.pageX - off.left);
    d.ORIGIN_DY = Math.round(ei.pageY - off.top);

    document.addEventListener(d.EVT_MOVE, d.mouse_move, false);
    document.addEventListener(d.EVT_UP, d.mouse_up, false);

    setTimeout(function() {
      if (d.SOURCE != null) {
        if (!d.IS_TRACKING) d.start_tracking();
      }
    },300);

    evt.preventDefault();
    return false;
  },

  start_tracking:function() {
    var d = Dragger;

    d.IS_TRACKING = true;
    d.GHOST = d.create_ghost(d.SOURCE);
    d.SOURCE.classList.add(d.SELECTED_CLASS);

    document.body.classList.add(d.DRAGGING_CLASS);

    if (d.start) d.start();
  },

  _isChild:function(el, src) {
    var p = el;
    while (p) {
      if (p == src) return true;
      p = p.parentElement;
    }
    return false;
  },

  mouse_move:function(evt) {
    var d = Dragger;

    if (d.FREEHAND_MODE) d.mouse_move_freehand(d, evt);
    else                 d.mouse_move_sortable(d, evt); 
  },

  mouse_move_freehand:function(d, evt) {
    var ei = d._eventInfo(evt);
    var posx = ei.pageX;
    var posy = ei.pageY;

    /*
    var r = d.CONTAINER.getBoundingClientRect();
    var outside = false;

    if      (ei.pageY < r.top) outside = true;
    else if (ei.pageY > r.top+r.height) outside = true;
    else if (ei.pageX < r.left) outside = true;
    else if (ei.pageX > r.left + r.width) outside = true;
    */

    if (d._lastei && ei.pageX === d._lastei.pageX && ei.pageY === d._lastei.pageY) {
      return;
    }

    d._lastei = ei;

    if (!d.IS_TRACKING) {
      var dx = Math.abs(posx - d.ORIGIN_X);
      var dy = Math.abs(posy - d.ORIGIN_Y);
      if (dy > 10) {
        d.start_tracking();

        evt.preventDefault();
        return false;
      }
    }
    else {
      if (d.GHOST) {
        d.GHOST.style.top = (posy - d.ORIGIN_DY) + "px";
        d.GHOST.style.left = (posx - d.ORIGIN_DX) + "px";
      }
  
      evt.preventDefault();
      return false;
    }
  },

  mouse_move_sortable:function(d, evt) {
    var ei = d._eventInfo(evt);
    var posx = ei.pageX;
    var posy = ei.pageY;

    if (d._lastei && ei.pageX === d._lastei.pageX && ei.pageY === d._lastei.pageY) {
      return;
    }

    d._lastei = ei;

    if (!d.IS_TRACKING) {
      var dx = Math.abs(posx - d.ORIGIN_X);
      var dy = Math.abs(posy - d.ORIGIN_Y);
      if (dy > 10) {
        d.start_tracking();

        evt.preventDefault();
        return false;
      }
    }
    else {
      if (d.GHOST) {
        d.GHOST.style.top = (posy - d.ORIGIN_DY) + "px";

        if (!d.LOCK_VERTICAL) {
          d.GHOST.style.left = (posx - d.ORIGIN_DX) + "px";
        }
      }
  
      var el = document.elementFromPoint(200, ei.pageY-window.pageYOffset);
      if (el != null && el.classList.contains("filler") && el != d.DESTINATION_INSERT) {
        d._clearel(d);

        var del = d.getDragDestination(el, d);

        if     (el == d.INSERT_BEFORE) el.classList.add("filler-over-before");
        else if (el == d.INSERT_AFTER) el.classList.add("filler-over-after");

        d.DESTINATION_INSERT = el;
      }
      else if (el != null && el != d.CONTAINER && !d._isChild(el, d.SOURCE)) {
        el = d.getDragDestination(el, d);

        if (el != null && el != d.SOURCE) {
          d._clearel(d);

          if (el != d.DESTINATION) {
            d.DESTINATION = el;
            if (!el.classList.contains("filler")) d.mk_filler(el);
          }
          else if (el != null) {
            d.DESTINATION_INSERT = null;
            el.classList.add('filler-over');
          }
        }
      }

      evt.preventDefault();
      return false;
    }
  },

  dropped: function(source, pos, destination) {
    //to be overridden
  },

  droppedExternal: function(source, pos, destination) {
    //to be overridden
  },

  mouse_up:function(evt) {
    var d = Dragger;

    document.removeEventListener(d.EVT_MOVE, d.mouse_move);
    document.removeEventListener(d.EVT_UP, d.mouse_up);

    setTimeout(function() {
      if (d.DESTINATION_INSERT && d.DESTINATION) {
        if (d.DESTINATION_INSERT == d.INSERT_BEFORE) d.dropped(d.SOURCE, "before", d.DESTINATION);
        else                                         d.dropped(d.SOURCE, "after",  d.DESTINATION);
      }
      else if (d.DESTINATION) {
        d.dropped(d.SOURCE, "over", d.DESTINATION);
      }

      d.cleanup();
      if (d.stop) d.stop(evt);
    },0);

    evt.preventDefault();
    return false;
  },

  cleanup:function() {
    var d = Dragger;

    d.rm_fillers();

    if (d.SOURCE) {
      d.SOURCE.classList.remove(d.SELECTED_CLASS);
    }

    if (d.GHOST) {
      if (d.USE_GHOST) {
        d.GHOST.parentElement.removeChild(d.GHOST);
      }
      else {
        d.GHOST.classList.remove(d.GHOST_CLASS);
        d.GHOST.style.pointerEvents = '';
      }
    }

    d._lastei = null;
    d.GHOST = null;
    d.DESTINATION = null;
    d.SOURCE = null;
    d.IS_TRACKING = false;

    document.body.classList.remove(d.DRAGGING_CLASS);
  },

  _clearel:function(d) {
    if (d.DESTINATION_INSERT) {
      d.DESTINATION_INSERT.classList.remove("filler-over-before");
      d.DESTINATION_INSERT.classList.remove("filler-over-after");
    }
    if (d.DESTINATION) {
      d.DESTINATION.classList.remove("filler-over");
    }
  },

  _mkfel:function(el, pos) {
    var rect = el.getBoundingClientRect();
    var h = 10;
    var ew = rect.width;
    var eh = rect.height;

    var fel;
    if (pos == -1 && this.SOURCE.nextElementSibling !== el) {
      fel = this.INSERT_BEFORE;
      if (fel == null) {
        fel = document.createElement("div");
        fel.style.position = "absolute";
        fel.classList.add(this.FILLER_CLASS);
        this.INSERT_BEFORE = fel;
        document.body.appendChild(fel);
      }
      else {
        fel.classList.remove("filler-over-before");
      }

      fel.style.top = (rect.y) + "px";
    }
    else if (pos == 1 && this.SOURCE.previousElementSibling !== el) {
      fel = this.INSERT_AFTER;
      if (fel == null) {
        fel = document.createElement("div");
        fel.style.position = "absolute";
        fel.classList.add(this.FILLER_CLASS);
        this.INSERT_AFTER = fel;
        document.body.appendChild(fel);
      }
      else {
        fel.classList.remove("filler-over-after");
      }

      fel.style.top = rect.y + (eh - h) + "px";
    }

    if (fel) {
      fel.style.left = rect.x + "px";
      fel.style.width = ew + "px";
      fel.style.height = h + "px";
    }
  },

  mk_filler:function(el) {
    if (this.ORIGIN_Y > this._lastei.pageY) {
      this._mkfel(el, -1);
    }
    else {
      this._mkfel(el, 1);
    }
  },

  rm_fillers:function() {
    var d = Dragger;
    $("."+d.FILLER_CLASS).remove();
    d.INSERT_BEFORE = null;
    d.INSERT_AFTER = null;
    if (d.DESTINATION) d.DESTINATION.classList.remove('filler-over');
  },

  init_dragger:function(el) {
    var d = Dragger;
    if ("ontouchstart" in window) {
      d.EVT_MOVE = "touchmove";
      d.EVT_DOWN = "touchstart";
      d.EVT_UP = "touchend";
    }

    el.addEventListener(d.EVT_DOWN, d.mouse_down, false);
    el.addEventListener('dragenter', d.drag_enter, false);
    el.addEventListener('dragleave', d.drag_leave, false);

    d.CONTAINER = el;
    el.classList.add("ui-dragger");
  },

  destroy_dragger:function(el) {
    var d = Dragger;

    document.removeEventListener(d.EVT_MOVE, d.mouse_move);
    document.removeEventListener(d.EVT_UP, d.mouse_up);

    d.removeEventListener(d.EVT_DOWN, d.mouse_down, false);
    d.cleanup();

    d.CONTAINER = null;
  }
};

jQuery.fn.dragger = function (options) {
  if (options == "destroy") {
    this.each(function(n,it) {
      jQuery.rm_crop_frame(it);
    });
  }
  else {
    jQuery.extend(Dragger, options);
    this.each(function(n,it) {
      Dragger.init_dragger(it);
    });
  }
};
