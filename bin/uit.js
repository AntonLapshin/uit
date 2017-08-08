(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.uit = global.uit || {})));
}(this, (function (exports) { 'use strict';

let _uid = 0;

/**
 * Typical PubSub implementation
 */
class PubSub {
  constructor() {
    this.handlers = {};
  }

  /**
   * Subscribes on event. Adds an event handler to a specific event.
   * @param {string} eventName 
   * @param {function} handler
   * @returns {number} _uid of the event handler
   */
  on(eventName, handler) {
    if (!this.handlers.hasOwnProperty(eventName)) {
      this.handlers[eventName] = [];
    }
    const token = _uid++;
    this.handlers[eventName].push({
      token,
      handler
    });
    return token;
  }

  /**
   * Calls the event handlers by event name
   * @param {string} eventName 
   * @param {object} args 
   * @returns {boolean} true of false if at lease one event handler exists or not
   */
  fire(eventName, arg1, arg2) {
    if (!this.handlers.hasOwnProperty(eventName)) {
      return false;
    }
    this.handlers[eventName].forEach(hh => hh.handler(arg1, arg2));
    return true;
  }

  /**
   * Unsubscribes the event handler by token
   * @param {number} token 
   * @returns {boolean} if successfully unsubscribed
   */
  off(token) {
    for (const eventName in this.handlers) {
      const hh = this.handlers[eventName];
      hh.forEach((h, i) => {
        if (h.token === token) {
          hh.splice(i, 1);
          return true;
        }
      });
    }
    return false;
  }

  /**
   * Subscribes on event only for one execution. Unsibscribes after
   * @param {string} eventName 
   * @param {function} handler 
   */
  once(eventName, handler) {
    const token = this.on(eventName, args => {
      handler(args);
      this.off(token);
    });
  }
}

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
const rules = {
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

/**
 * Data-binding feature implementation
 */
function dataBind() {
  if (!this.els || this.els.length === 0) {
    return;
  }
  const els = Array.prototype.filter.call(this.els, el => {
    return el.matches(`[${opts.DATA_BIND_ATTRIBUTE}]`);
  });
  els.forEach(el => {
    const bindAttr = el.getAttribute(opts.DATA_BIND_ATTRIBUTE);
    if (!bindAttr) {
      return;
    }
    const statements = bindAttr.split(",");
    statements.forEach(statement => {
      const parts = statement.split(":");
      const key = parts[0].trim();
      const value = parts[1].trim();
      if (rules[key]) {
        rules[key].call(this, el, value, statement);
      } else {
        throw new Error(`binding rule <${key}> doesn't exist`);
      }
    });
  });
}

const opts = {
  DATA_NAME_ATTRIBUTE: "data-uit-name",
  DATA_READY_ATTRIBUTE: "data-uit-ready",
  DATA_PATH_ATTRIBUTE: "data-uit-path",
  DATA_CALL_ATTRIBUTE: "data-uit-call",
  DATA_BIND_ATTRIBUTE: "data-bind",
  CALL_BY_INDEX: "byIndex",
  BASE_URL: "./components/"
};

/**
 * Component's instance implementation
 */
class Component extends PubSub {
  /**
   * Creates a component's instance
   * @param {string} name Name of the component
   * @param {string} path The full path of the component
   * @param {Element} el DOM element
   * @param {function} logic Custom logic of the component
   */
  constructor(name, path, el, logic) {
    super();
    this.name = name;
    this.path = path;
    this.el = el;
    this.els = el.querySelectorAll(`*:not([${opts.DATA_NAME_ATTRIBUTE}])`);
    this.children = {};
    logic && logic(this);
    dataBind.call(this);
  }

  /**
   * Sets data to the component instance
   * @param {object} data 
   * @returns {Component} instance
   */
  set(data) {
    this.olddata = this.data;
    this.data = data;
    this.fire("set", data, this.olddata);
    return this;
  }

  /**
   * Fires load event
   * @returns {Component} instance
   */
  load() {
    this.fire("load");
    return this;
  }

  /**
   * Shows element
   * @returns {Component} instance
   */
  show() {
    this.el.style.display = "";
    this.fire("show");
    return this;
  }

  /**
   * Hides element
   * @returns {Component} instance
   */
  hide() {
    this.el.style.display = "none";
    this.fire("hide");
    return this;
  }

  /**
   * Tests element
   * @returns {Component} instance
   */
  test() {
    this.el.style.display = "";
    this.fire("test");
    return this;
  }
}

const loadImage = (url, resolve) => {
  const img = new Image();
  img.onload = () => {
    resolve(img);
  };
  img.src = url;
};

const loadStyle = (url, resolve) => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
  resolve(link);
};

const loadScript = (url, resolve) => {
  const script = document.createElement("script");
  script.type = "text/javascript";

  script.onload = function() {
    resolve(script);
  };

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};

const loadView = (url, resolve) => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.responseText.length > 0) {
      resolve(xhr.responseText);
    }
  };
  xhr.send();
};

const TIMEOUT = 3000;
const LOADERS = [
  {
    load: loadImage,
    ext: /\b(png|jpg|gif)\b/
  },
  {
    load: loadStyle,
    ext: /\b(css)\b/
  },
  {
    load: loadScript,
    ext: /\b(js)\b/
  },
  {
    load: loadView,
    ext: /\b(html)\b/
  }
];

/**
 * Loads an external resource
 * @param {string} url - URL of the the external resource
 * @returns {Promise}
 */
const load = url => {
  const ext = url.split(".").pop();
  const loader = LOADERS.find(l => l.ext.test(ext));
  return new Promise(resolve => {
    if (!loader) {
      throw `Loader for <${ext}> files has not been implemented`;
    }
    if (!loader.cache) {
      loader.cache = {};
    }
    loader.load(url, res => {
      loader.cache[url] = res;
      resolve(res);
    });
    setTimeout(() => {
      if (loader.cache[url]) {
        return;
      }
      loader.cache[url] = true;
      resolve(true);
    }, TIMEOUT);
  });
};

const combinePath = (parentPath, name) => {
  return `${parentPath}+${name}`;
};
const findAncestor = (el, selector) => {
  while ((el = el.parentElement) && !el.matches(selector));
  return el;
};

const adjustPath = (parentEl, parentPath, name, call) => {
  let path = combinePath(parentPath, name);

  if (parentEl) {
    const parentInstance = instances[parentPath];
    if (call === opts.CALL_BY_INDEX) {
      if (!parentInstance.children[name]) {
        parentInstance.children[name] = [];
      }
      const index = parentInstance.children[name].length;
      path += `[${index}]`;
    } else if (typeof call === "string") {
      if (!parentInstance.children[name]) {
        parentInstance.children[name] = {};
      }
      path += `[${call}]`;
    }
  }
  return path;
};

const adjustParentChildren = (
  parentEl,
  name,
  parentPath,
  call,
  instance
) => {
  if (!parentEl) {
    return;
  }
  const parentInstance = instances[parentPath];
  if (call === opts.CALL_BY_INDEX) {
    parentInstance.children[name].push(instance);
  } else if (call) {
    parentInstance.children[name][call] = instance;
  } else {
    parentInstance.children[name] = instance;
  }
  instance.parent = parentInstance;
};

const components = {};
const instances = {};

/**
 * Builds a component based on element. Creates a new component instance
 * @param {Element} el Component element
 * @returns {Promise}
 */
const build = el => {
  return new Promise(resolve => {
    const name = el.getAttribute(opts.DATA_NAME_ATTRIBUTE);
    const component = components[name];
    if (!component.view) {
      throw `View of ${name} component is undefined`;
    }

    const parentEl = findAncestor(el, `[${opts.DATA_NAME_ATTRIBUTE}]`);
    const parentPath = parentEl
      ? parentEl.getAttribute(opts.DATA_PATH_ATTRIBUTE)
      : "root";
    const call = el.getAttribute(opts.DATA_CALL_ATTRIBUTE);
    const path = adjustPath(parentEl, parentPath, name, call);

    el.classList.add(`_${name}`);
    el.setAttribute(opts.DATA_READY_ATTRIBUTE, true);
    el.setAttribute(opts.DATA_PATH_ATTRIBUTE, path);
    el.innerHTML = component.view;

    const instance = new Component(name, path, el, component.logic);
    instances[path] = instance;

    adjustParentChildren(parentEl, name, parentPath, call, instance);

    lookup(el).then(() => {
      instance.load();
      resolve(instance);
    });
  });
};

/**
 * Lookup for components inside of the container
 * @param {Element} el Container
 * @returns {Promise}
 */
const lookup = el => {
  const els = el.querySelectorAll(
    `[${opts.DATA_NAME_ATTRIBUTE}]:not([${opts.DATA_READY_ATTRIBUTE}]`
  );

  const promises = Array.prototype.map.call(els, el => {
    return build(el);
  });
  return Promise.all(promises).then(result => {
    return result[0];
  });
};

/**
 * Mounts a component into DOM and looks for child components inside
 * @param {Element} el Container
 * @param {string} name Name of the component
 * @param {string} html Input html string
 * @returns {Promise<Component[]>} List of mounted components
 * @ignore
 */
const mount = (el, name, html) => {
  if (el instanceof Element !== true) {
    throw "el is not an Element instance";
  }
  return loadComponent(name).then(() => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const item = temp.firstChild;
    el.appendChild(item);
    return lookup(el);
  });
};

/**
 * Loads all component's dependencies
 * @param {string} name - Name of the component
 * @param {Array} deps - List of the dependencies
 * @returns {Promise<object[]>} - List of the loaded dependencies
 * @ignore
 */
const loadDeps = (name, deps) => {
  const promises = deps.map(dep => {
    if (dep.indexOf(".") === -1) {
      return loadComponent(dep);
    }
    const url = opts.BASE_URL + dep;
    return load(url);
  });

  return Promise.all(promises);
};

/**
 * Loads logic + view + style. The define method is called after loading
 * @param {string} name Name of the component
 * @returns {Promise<object>} Component definition
 * @ignore
 */
const loadComponent = name => {
  if (components[name]) {
    return components[name].promise;
  }

  return new Promise(resolve => {
    event.on(`${name}.load`, component => {
      resolve(component);
    });
    loadDeps(name, [name + ".js"]);
  });
};

/**
 * PubSub instance
 */
const event = new PubSub();

/**
 * Defines a new component
 * @param {string} name - Name of the component
 * @param {string} view - [Optional] HTML View
 * @param {string} style - [Optional] CSS
 * @param {Array<string>} deps - [Optional] List of all dependencies (urls)
 * @param {function} Logic - Logic of the component
 */
function define(...args) {
  const name = args[0];
  const view = typeof args[1] === "string" ? args[1] : null;
  const style = typeof args[2] === "string" ? args[2] : null;
  if (style) {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = style;
    document.head.appendChild(styleTag);
  }
  let i = view && style ? 3 : view || style ? 2 : 1;
  let deps = args[i] && args[i].constructor === Array && args[i];
  if (deps) {
    i++;
  } else {
    deps = [];
  }
  const Logic = args[i] && typeof args[i] === "function" && args[i];
  const component = {
    name: name,
    view: view,
    deps: null
  };
  components[name] = component;
  component.promise = new Promise(resolve => {
    loadDeps(name, deps).then(res => {
      if (!view) {
        component.view = res[0];
      }
      component.deps = res;
      if (Logic) {
        component.logic = context => {
          Logic.call(context, context, component.deps);
          //
          // Add a testing logic if it exists
          //
          if (component.test) {
            context.on("test", () => {
              component.test(context);
            });
          }
        };
      }
      event.fire(`${name}.load`, component);
      resolve(component);
    });
  });
}

/**
 * Adds a test method to the component
 * @param {string} name Name of the component
 * @param {function} func Test logic (mock data)
 */
function test(name, func) {
  components[name].test = func;
}

/**
 * Loads and appends a droplet into container
 * @param {selector|string|Element} el - Container
 * @param {string} name - Name of the component
 * @returns {Promise<Component[]>} - List of the added component instances
 */
function append(el, name) {
  return mount(el, name, `<div ${opts.DATA_NAME_ATTRIBUTE}="${name}"></div>`);
}

/**
 * Runs the environment by a selected component via search string
 * @param {selector|string|Element} el Container
 * @param {string} name [Optional] Name of the component
 * @returns {Promise<Component[]>} - List of the added component instances
 */
function run(el, name) {
  name =
    name ||
    (window.location.search.length > 0
      ? window.location.search.substring(1)
      : null);

  return append(el, name).then(instance => {
    if (window.uitDebug) {
      return window.uitDebug.debug(instance);
    }
    return instance;
  });
}

exports.event = event;
exports.define = define;
exports.test = test;
exports.append = append;
exports.run = run;
exports.load = load;

Object.defineProperty(exports, '__esModule', { value: true });

})));
