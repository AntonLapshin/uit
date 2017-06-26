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

const combinePath = (parentPath, name) => {
  return `${parentPath ? parentPath + "+" : ""}${name}`;
};
const matches = (el, selector) => {
  return (el.matches ||
    el.matchesSelector ||
    el.msMatchesSelector ||
    el.mozMatchesSelector ||
    el.webkitMatchesSelector ||
    el.oMatchesSelector)
    .call(el, selector);
};
const findAncestor = (el, selector) => {
  while ((el = el.parentElement) && !matches(el, selector));
  return el;
};

const blocks = {};
const _instances = {};

/**
 * Builds a block based on element. Creates a new block instance
 * @param {Element} el Block element
 * @returns {Promise}
 */
const build = el => {
  return new Promise(resolve => {
    const name = el.getAttribute(opts.DATA_BLOCK_NAME_ATTRIBUTE);
    const block = blocks[name];
    if (!block.view) {
      throw `View of ${name} block is undefined`;
    }

    const parentEl = findAncestor(el, `[${opts.DATA_BLOCK_NAME_ATTRIBUTE}]`);
    const parentPath = parentEl
      ? parentEl.getAttribute(opts.DATA_BLOCK_PATH_ATTRIBUTE)
      : "root";
    const call = el.getAttribute(opts.DATA_BLOCK_CALL_ATTRIBUTE);
    let path = combinePath(parentPath, name);

    if (parentEl) {
      const parentBlock = _instances[parentPath];
      if (call === opts.CALL_BY_INDEX) {
        if (!parentBlock.children[name]) {
          parentBlock.children[name] = [];
        }
        const index = parentBlock.children[name].length;
        path += `[${index}]`;
      } else if (typeof call === "string") {
        if (!parentBlock.children[name]) {
          parentBlock.children[name] = {};
        }
        path += `[${call}]`;
      }
    }

    el.classList.add(name);
    el.setAttribute(opts.DATA_BLOCK_READY_ATTRIBUTE, true);
    el.setAttribute(opts.DATA_BLOCK_PATH_ATTRIBUTE, path);
    el.innerHTML = block.view;

    const blockInstance = new Block(name, path, el, block.logic);
    _instances[path] = blockInstance;

    if (parentEl && parentPath) {
      const parentBlock = _instances[parentPath];
      if (call === opts.CALL_BY_INDEX) {
        parentBlock.children[name].push(blockInstance);
      } else if (call) {
        parentBlock.children[name][call] = blockInstance;
      } else {
        parentBlock.children[name] = blockInstance;
      }
      blockInstance.parent = parentBlock;
    }

    lookup(el).then(() => {
      blockInstance.load();
      resolve(blockInstance);
    });
  });
};

/**
 * Lookup for blocks inside of the container
 * @param {Element} el Container
 * @returns {Promise}
 */
const lookup = el => {
  const els =
    el.querySelectorAll(
      `[${opts.DATA_BLOCK_NAME_ATTRIBUTE}]:not([${opts.DATA_BLOCK_READY_ATTRIBUTE}]`
    ) || [];

  const promises = Array.prototype.map.call(els, el => {
    return build(el);
  });
  return Promise.all(promises);
};

const getTarget = (ctx, p) => {
  if (p.length === 0) {
    return ctx;
  }
  ctx = ctx[p[0]];
  p.shift();
  return getTarget(ctx, p);
};

const bind = (target, method) => {
  if (target.on) {
    target.on(method);
    method(target());
  } else {
    method(target);
  }
};

const unbind = (target, method) => {
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

function handle(path, method) {
  let target;

  const p = path.split(".");
  if (p[0] !== "data") {
    target = getTarget(this, [...p]);
    bind(target, method);
  } else {
    p.shift();
    this.on("set", data => {
      if (this.olddata) {
        target = getTarget(this.olddata, [...p]);
        unbind(target, method);
      }
      target = getTarget(data, [...p]);
      bind(target, method);
    });
  }
}

/**
 * List of predefined rules
 */
const rules = {
  /**
   * [src] attribute binding
   */
  src: function(el, path) {
    handle.call(this, path, v => {
      el.setAttribute("src", getv(v));
    });
  },
  /**
   * [text] value binding
   */
  text: function(el, path) {
    handle.call(this, path, v => {
      el.textContent = getv(v);
    });
  },
  /**
   * [class] binding
   */
  class: function(el, path, statement) {
    const className = statement.split(":")[2].trim();
    handle.call(this, path, v => {
      el.classList.toggle(className, getv(v));
    });
  },
  /**
   * [href] attribute binding
   */
  href: function(el, path) {
    handle.call(this, path, v => {
      el.setAttribute("href", getv(v));
    });
  },
  /**
   * [val] binding
   */
  val: function(el, path) {
    handle.call(this, path, v => {
      el.value = getv(v);
    });
  },
  /**
   * [html] content binding
   */
  html: function(el, path) {
    handle.call(this, path, v => {
      el.innerHTML = getv(v);
    });
  },
  /**
   * [visible] visibility of element binding
   */
  visible: function(el, path) {
    handle.call(this, path, v => {
      el.style.display = !getv(v) ? "none" : "";
    });
  },
  /**
   * [invisible] visibility of element binding
   */
  invisible: function(el, path) {
    handle.call(this, path, v => {
      el.style.display = !getv(v) ? "" : "none";
    });
  },
  /**
   * [disabled] class binding
   */
  enable: function(el, path) {
    handle.call(this, path, v => {
      el.classList.toggle("disabled", !getv(v));
    });
  },
  /**
   * [disabled] class binding
   */
  disable: function(el, path) {
    handle.call(this, path, v => {
      el.classList.toggle("disabled", getv(v));
    });
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
   * [prop] adds a link to an element
   */
  prop: function(el, value) {
    this[value] = el;
  }
};

/**
 * Data-binding feature implementation
 */
function dataBind() {
  if (!this.elAll || this.elAll.length === 0) {
    return;
  }
  const els = Array.prototype.filter.call(this.elAll, el => {
    return matches(el, `[${opts.DATA_BIND_ATTRIBUTE}]`);
  });
  els.forEach(el => {
    const statements = el.getAttribute(opts.DATA_BIND_ATTRIBUTE).split(",");
    statements.forEach(statement => {
      const parts = statement.split(":");
      const key = parts[0].trim();
      const value = parts[1].trim();
      if (rules[key]) {
        rules[key].call(this, el, value, statement);
      }
    });
  });
}

/**
 * TODOs: Add comments
 */
const opts = {
  DATA_BLOCK_NAME_ATTRIBUTE: "data-block-name",
  DATA_BLOCK_READY_ATTRIBUTE: "data-block-ready",
  DATA_BLOCK_PATH_ATTRIBUTE: "data-block-path",
  DATA_BLOCK_CALL_ATTRIBUTE: "data-block-call",
  DATA_BIND_ATTRIBUTE: "data-bind",
  CALL_BY_INDEX: "byIndex",
  BASE_URL: "./blocks/"
};

/**
 * Block's instance implementation
 */
class Block extends PubSub {
  /**
   * Creates a block's instance
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
    this.elAll = el.querySelectorAll(
      `*:not([${opts.DATA_BLOCK_NAME_ATTRIBUTE}])`
    );
    this.children = {};
    logic(this);
    dataBind.call(this);
  }

  /**
   * Sets data to the block instance
   * @param {object} data 
   * @returns {Block} instance
   */
  set(data) {
    this.olddata = this.data;
    this.data = data;
    this.fire("set", data, this.olddata);
    return this;
  }

  /**
   * Fires load event
   * @returns {Block} instance
   */
  load() {
    this.fire("load");
    return this;
  }

  /**
   * Shows element
   * @returns {Block} instance
   */
  show() {
    this.el.style.display = "";
    this.fire("show");
    return this;
  }

  /**
   * Hides element
   * @returns {Block} instance
   */
  hide() {
    this.el.style.display = "none";
    this.fire("hide");
    return this;
  }

  /**
   * Tests element
   * @returns {Block} instance
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

/**
 * Typical implementation of the Observable variables
 */
class ObservableValue extends PubSub {
  constructor(data) {
    super();
    this.data = data;
  }

  update(data) {
    this.olddata = this.data;
    this.data = data;
    return this.fire();
  }

  fire() {
    return super.fire("update", this.data, this.olddata);
  }

  on(h) {
    return super.on("update", h);
  }
}

const Observable = data => {
  const value = new ObservableValue(data);

  const ObservableBehavior = data => {
    if (data === undefined) {
      return value.data;
    }
    value.update(data);
    return ObservableBehavior;
  };

  /**
   * Subscribes on variable's changes
   * @param {function} handler - Event Handler
   * @returns {number} - token
   */
  ObservableBehavior.on = h => {
    return value.on(h);
  };
  /**
   * Unsubscribes from variable's changes
   * @param {number} token - Token for unsubscribe
   * @returns {boolean} - Result
   */
  ObservableBehavior.off = token => {
    return value.off(token);
  };

  return ObservableBehavior;
};

/**
 * Mounts a block into DOM and looks for another blocks inside
 * @param {Element} el - Container
 * @param {string} name - Name of the component
 * @param {string} html - Input html string
 * @returns {Promise<Block[]>} - List of mounted blocks
 * @ignore
 */
const mount = (el, name, html) => {
  if (el instanceof Element !== true) {
    throw "el is not an Element instance";
  }
  return loadBlock(name).then(() => {
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
  const baseUrl = opts.BASE_URL + name + "/";
  const promises = deps.map(dep => {
    if (dep.indexOf(".") === -1) {
      return loadBlock(dep);
    }
    const url = baseUrl + dep;
    return load(url);
  });

  return Promise.all(promises);
};

/**
 * Loads logic + view + style. The define method is called after loading
 * @param {string} name - Name of the component
 * @returns {Promise<object>} - Block definition
 * @ignore
 */
const loadBlock = name => {
  if (blocks[name]) {
    return blocks[name].promise;
  }

  return new Promise(resolve => {
    event.on(`${name}.load`, block => {
      resolve(block);
    });
    loadDeps(name, ["logic.js"]);
  });
};

/**
 * PubSub instance
 */
const event = new PubSub();

/**
 * Defines a new component (block)
 * @param {string} name - Name of the block
 * @param {Array} deps - List of all dependencies
 * @param {function} Logic - Logic of the component
 */
function define(name, deps, Logic) {
  const block = {
    name: name,
    deps: null
  };
  blocks[name] = block;
  block.promise = new Promise(resolve => {
    loadDeps(name, ["view.html", "style.css", ...deps]).then(args => {
      block.view = args[0];
      block.deps = args;
      block.logic = context => {
        Logic.call(context, context, block.deps);
      };
      event.fire(`${name}.load`, block);
      resolve(block);
    });
  });
}

/**
 * Loads and appends a droplet into container
 * @param {selector|string|Element} el - Container
 * @param {string} name - Name of the block
 * @returns {Promise<Block[]>} - List of the added block instances
 */
function append(el, name) {
  return mount(
    el,
    name,
    `<div ${opts.DATA_BLOCK_NAME_ATTRIBUTE}="${name}"></div>`
  );
}

/**
 * Runs the environment by the selected block via search string
 * @param {selector|string|Element} el - Container
 * @returns {Promise<Block[]>} - List of the added block instances
 */
function run(el) {
  const search = window.location.search;
  const name = search.length > 0 ? search.substring(1) : null;

  return append(el, name).then(instances => {
    instances[0].test();
    return instances;
  });
}

exports.event = event;
exports.define = define;
exports.append = append;
exports.run = run;
exports.Observable = Observable;

Object.defineProperty(exports, '__esModule', { value: true });

})));
