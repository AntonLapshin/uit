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
  let target;

  if (Array.isArray(path)) {
    path.forEach(pathItem => {
      handle.call(this, pathItem, method);
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
        if (this.olddata) {
          target = getTarget(self.olddata, p);
          unbind(target, method);
        }
        target = getTarget(data, p);
        bind(target, method);
      }, 0);
    });
  }
};

export const rules = {
  src: (el, path) => {
    handle.call(this, path, v => {
      el.setAttribute("src", getv(v));
    });
  },
  text: (el, path) => {
    handle.call(this, path, v => {
      el.textContent = getv(v);
    });
  },
  class: (el, path, statement) => {
    const className = statement.split(":")[2].trim();
    handle.call(this, path, v => {
      el.classList.toggle(className, getv(v));
    });
  },
  href: (el, path) => {
    handle.call(this, path, v => {
      el.setAttribute("href", getv(v));
    });
  },
  val: (el, path) => {
    handle.call(this, path, v => {
      el.value = getv(v);
    });
  },
  html: (el, path) => {
    handle.call(this, path, v => {
      el.innerHTML = getv(v);
    });
  },
  visible: (el, path) => {
    handle.call(this, path, v => {
      el.style.display = !getv(v) ? "none" : "";
    });
  },
  invisible: (el, path) => {
    handle.call(this, path, v => {
      el.style.display = !getv(v) ? "" : "none";
    });
  },
  enable: (el, path) => {
    handle.call(this, path, v => {
      el.classList.toggle("disabled", !getv(v));
    });
  },
  disable: (el, path) => {
    handle.call(this, path, v => {
      el.classList.toggle("disabled", getv(v));
    });
  },
  click: (el, methodName) => {
    el.addEventListener("click", () => {
      this[methodName].call(this, el);
      return false;
    });
  },
  prop: (el, value) => {
    this[value] = el;
  }
};
