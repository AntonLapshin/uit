const getTarget = (ctx, p) => {
  if (p.length === 0) {
    return ctx;
  }
  ctx = ctx[p[0]];
  p.shift();
  return getTarget(ctx, p);
};

const bind = (ctx, property, method) => {
  if (ctx.on) {
    ctx.on(property, method);
  }
  method(ctx[property]);
};

const unbind = (ctx, property, method) => {
  if (ctx.off) {
    ctx.off(method);
  }
};

function handle(path, method) {
  const p = path.split(".");
  const property = p.pop();
  let ctx;

  p.shift();
  this.on("set", data => {
    if (this.olddata) {
      ctx = getTarget(this.olddata, p);
      unbind(ctx, property, method);
    }
    ctx = getTarget(data, p);
    bind(ctx, property, method);
  });
}

/**
 * List of predefined rules
 */
export const rules = {
  /**
   * [attr] binding
   */
  attr: function(el, path, statement) {
    const attrName = statement.split(":")[2].trim();
    handle.call(this, path, v => {
      if (v === false){
        el.removeAttribute(attrName);
      } else {
        el.setAttribute(attrName, v);
      }
    });
  },
  /**
   * [prop] binding
   */
  prop: function(el, path, statement) {
    const propName = statement.split(":")[2].trim();
    handle.call(this, path, v => {
      el[propName] = v;
    });
  },
  /**
   * [class] binding
   */
  class: function(el, path, statement) {
    const className = statement.split(":")[2].trim();
    handle.call(this, path, v => {
      el.classList.toggle(className, v);
    });
  },
  /**
   * [src] attribute binding
   */
  src: function(el, path) {
    rules.attr.call(this, el, path, `attr: ${path}: src`);
  },
  /**
   * [href] attribute binding
   */
  href: function(el, path) {
    rules.attr.call(this, el, path, `attr: ${path}: href`);
  },
  /**
   * [text] value binding
   */
  text: function(el, path) {
    rules.prop.call(this, el, path, `prop: ${path}: textContent`);
  },
  /**
   * [val] binding
   */
  val: function(el, path) {
    rules.prop.call(this, el, path, `prop: ${path}: value`);
  },
  /**
   * [html] content binding
   */
  html: function(el, path) {
    rules.prop.call(this, el, path, `prop: ${path}: innerHTML`);
  },
  /**
   * [visible] visibility of element binding
   */
  visible: function(el, path) {
    handle.call(this, path, v => {
      el.style.display = !v ? "none" : "";
    });
  },
  /**
   * [invisible] visibility of element binding
   */
  invisible: function(el, path) {
    handle.call(this, path, v => {
      el.style.display = !v ? "" : "none";
    });
  },
  /**
   * [disabled] class binding
   */
  enable: function(el, path) {
    handle.call(this, path, v => {
      el.classList.toggle("disabled", !v);
    });
  },
  /**
   * [disabled] class binding
   */
  disable: function(el, path) {
    rules.class.call(this, el, path, `class: ${path}: disabled`);
  },
  /**
   * [click] binding
   */
  click: function(el, methodName) {
    el.addEventListener("click", () => {
      this[methodName].call(this, el);
      return false;
    });
  },
  /**
   * [ref] adds a link to an element
   */
  ref: function(el, value) {
    this[value] = el;
  }
};
