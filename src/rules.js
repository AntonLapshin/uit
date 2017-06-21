const getTarget = (ctx, p) => {
  if (ctx == null) {
    return null;
  }
  if (p.length === 0) {
    return ctx;
  }
  ctx = ctx[p[0]];
  p.shift();
  return getTarget(ctx, p);
};

const bind = (target, method) => {
  if (target == null) {
    return;
  }
  if (target.on) {
    target.on(method);
    method(target());
  } else {
    method(target);
  }
};

const unbind = (target, method) => {
  if (target == null) {
    return;
  }
  if (target.off) {
    target.off(method);
  }
};

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

  const p = path.split(".");
  if (p[0] !== "data") {
    target = getTarget(self, p);
    bind(target, method);
  } else {
    p.shift();
    self.on("set", data => {
      window.setTimeout(() => {
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
    handle.call(this, path, v => {
      el.setAttribute("src", getv(v));
    });
  },
  text: function(el, path) {
    handle.call(this, path, function(v) {
      el.textContent = getv(v);
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
      el.setAttribute("href", getv(v));
    });
  },
  val: function($e, path) {
    handle.call(this, path, function(v) {
      $e.val(getv(v));
    });
  },
  html: function($e, path) {
    handle.call(this, path, function(v) {
      el.innerHTML = getv(v);
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
