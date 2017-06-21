  function getTarget(ctx, p) {
    if (ctx == null)
      return null;
    var val = ctx;
    $.each(p, function(i, name) {
      if (val == null) {
        //console.log( '{0} is not found in object {1}'.f(p, JSON.stringify(ctx)) );
        return null;
      }
      val = val[name];
    });
    if (val == null) {
      //console.log( '{0} is not found in object {1}'.f(p, JSON.stringify(ctx)) );
      return null;
    }
    return val;
  }

  function bind(target, method) {
    if (target == null)
      return;
    if (target.on) {
      target.on(method);
      method(target());
    } else
      method(target);
  }

  function unbind(target, method) {
    if (target == null)
      return;
    if (target.off)
      target.off(method);
  }

const getv = v => {
  if (v == null) {
    return v;
  }

  return v.on ? v() : v;
};

const handle = (path, method) => {
  const self = this;
  let target;

  if (Array.isArray(path)) {
    path.forEach(pathItem => {
      handle.call(self, pathItem, method);
    });
    return;
  }

  var p = path.split(".");
  if (p[0] !== "data") {
    target = getTarget(self, p);
    bind(target, method);
  } else {
    p.shift();
    self.on("set", function(data) {
      window.setTimeout(function() {
        if (self.olddata) {
          target = getTarget(self.olddata, p);
          unbind(target, method);
        }
        target = getTarget(data, p);
        bind(target, method);
      }, 0);
    });
  }
};

export const Rules = {
  title: function(el, path, statement) {
    let place = statement.split(":")[2];
    place = place ? place.trim() : "bottom-right";
    handle.call(this, path, v => {
      el.setAttribute("data-title", getv(v));
      el.setAttribute("data-place", place);
    });
  },
  src: function(el, path) {
    handle.call(this, path, (v) => {
      $e.attr("src", getv(v));
    });
  },
  text: function($e, path) {
    handle.call(this, path, function(v) {
      $e.text(getv(v));
    });
  },
  class: function($e, path, statement) {
    var className = statement.split(":")[2].trim();
    handle.call(this, path, function(v) {
      $e.toggleClass(className, getv(v));
    });
  },
  sprite: function($e, path, statement) {
    handle.call(this, path, function(v) {
      $e.addClass(getv(v));
    });
  },
  href: function($e, path) {
    handle.call(this, path, function(v) {
      $e.attr("href", getv(v));
    });
  },
  val: function($e, path) {
    handle.call(this, path, function(v) {
      $e.val(getv(v));
    });
  },
  html: function($e, path) {
    handle.call(this, path, function(v) {
      $e.html(getv(v));
    });
  },
  visible: function($e, path) {
    handle.call(this, path, function(v) {
      $e[!getv(v) ? "hide" : "show"]();
    });
  },
  invisible: function($e, path) {
    handle.call(this, path, function(v) {
      $e[!getv(v) ? "show" : "hide"]();
    });
  },
  enable: function($e, path) {
    handle.call(this, path, function(v) {
      $e.toggleClass("disabled", !getv(v));
    });
  },
  disable: function($e, path) {
    handle.call(this, path, function(v) {
      $e.toggleClass("disabled", getv(v));
    });
  },
  click: function($e, methodName) {
    var self = this;
    $e.click(function() {
      self[methodName].call(self, $e);
      return false;
    });
  },
  click2: function($e, methodName) {
    var self = this;
    $e.click(function() {
      self[methodName].call(self, $e);
    });
  },
  fire: function($e, event) {
    $e.click(function() {
      Droplet.fire(event);
      return false;
    });
  },
  place: function($e, value) {
    $e.attr("data-placement", value);
  },
  prop: function($e, value) {
    this["$" + value] = $e;
  }
};
