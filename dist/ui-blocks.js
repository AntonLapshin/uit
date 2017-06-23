(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.UIBlocks = global.UIBlocks || {})));
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
    setTimeout(() => {
      this.handlers[eventName].forEach(hh => hh.handler(arg1, arg2));
    }, 0);
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

/**
 * TODOs: Add comments
 */
const opts = {
  DATA_BLOCK_NAME_ATTRIBUTE: "data-block-name",
  DATA_BLOCK_READY_ATTRIBUTE: "data-block-ready",
  DATA_BLOCK_PATH_ATTRIBUTE: "data-block-path",
  DATA_BLOCK_CALL_ATTRIBUTE: "data-block-call",
  CALL_BY_INDEX: "byIndex"
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
    this.elAll = el.querySelector(
      `*:not('[${opts.DATA_BLOCK_NAME_ATTRIBUTE}]')`
    );
    this.children = {};
    logic(this);
  }

  set(data) {
    this.fire("set", data);
    this.olddata = this.data;
    this.data = data;
    return this;
  }

  load() {
    this.fire("load");
    return this;
  }

  show() {
    this.el.style.display = "";
    this.fire("show");
  }

  hide() {
    this.el.style.display = "none";
    this.fire("hide");
  }

  test() {
    this.el.style.display = "none";
    this.fire("test");
    return this;
  }
}

/**
 * Typical implementation of the Observable variables
 */

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
  _styles[url] = link;
  resolve();
};

const loadScript = (url, resolve) => {
  const script = document.createElement("script");
  script.type = "text/javascript";

  if (script.readyState) {
    // IE
    script.onreadystatechange = function() {
      if (script.readyState == "loaded" || script.readyState == "complete") {
        script.onreadystatechange = null;
        _scripts[url] = script;
        resolve();
      }
    };
  } else {
    // Others
    script.onload = function() {
      _scripts[url] = script;
      resolve(script);
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};

const loadView = (url, resolve) => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (this.readyState !== 4 || this.status !== 200) {
      return;
    }
    _views[url] = this.responseText;
    resolve(_views[url]);
  };
  xhr.send();
};

const TIMEOUT = 3000;
const LOADERS = [
  {
    type: "image",
    load: loadImage,
    ext: /png|jpg|gif/
  },
  {
    type: "style",
    load: loadStyle,
    ext: /css/
  },
  {
    type: "script",
    load: loadScript,
    ext: /js/
  },
  {
    view: "view",
    load: loadView,
    ext: /html/
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
  if (!loader) {
    throw `Loader for <${ext}> files has not been implemented`;
  }
  return new Promise((resolve, reject) => {
    if (!loader.cache) {
      loader.cache = {};
    }
    loader.load(res => {
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

const BASE_URL = "./blocks/{0}/";
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
const _blocks = {};
const _instances = {};

function build(el) {
  return new Promise(resolve => {
    const name = el.getAttribute(opts.DATA_BLOCK_NAME_ATTRIBUTE);
    const block = _blocks[name];
    if (!block.view) {
      throw `View of ${name} droplet is undefined`;
    }

    const parentEl = findAncestor(el, `[${opts.DATA_BLOCK_NAME_ATTRIBUTE}]`);
    const parentPath = parentEl.getAttribute(opts.DATA_BLOCK_PATH_ATTRIBUTE);
    const call = el.getAttribute(opts.DATA_BLOCK_CALL_ATTRIBUTE);
    let path = combinePath(parentPath, name);

    if (parentEl && parentPath) {
      const parentBlock = _instances[parentPath];
      if (call === opts.CALL_BY_INDEX) {
        if (!parent.children[name]) {
          parent.children[name] = [];
        }
        const index = parent.children[name].length;
        path += `[${index}]`;
      } else if (typeof call === "string") {
        if (!parent.children[name]) {
          parent.children[name] = {};
        }
        path += `[${call}]`;
      }
    }

    el.classList.add(name);
    el.addAttribute(opts.DATA_BLOCK_READY_ATTRIBUTE, true);
    el.addAttribute(opts.DATA_BLOCK_PATH_ATTRIBUTE, path);
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
}

/**
 * Lookup for blocks inside of the container
 * @param {Element} el Container
 * @returns {Promise}
 */
function lookup(el) {
  const els = el.querySelector(
    `[${opts.DATA_BLOCK_ATTRIBUTE}]:not([${opts.DATA_BLOCK_READY_ATTRIBUTE}]`
  );

  if (els.length === 0) {
    return new Promise(resolve => {
      resolve();
    });
  }

  const promises = Array.prototype.map.call(els, el => {
    return build(el);
  });
  return Promise.all(promises);
}

/**
 * 
 * @param {Element} el - Container
 * @param {string} name - Name of the component
 * @param {string} html - Input html string
 * @returns {Promise}
 */
const mount = (el, name, html) => {
  if (el instanceof Element !== true) {
    throw "el is not Element";
  }
  return loadBlock(name).then(() => {
    el.innerHTML = html;
    return lookup(el);
  });
};

/**
 * Loads all component's dependencies
 * @param {string} name - Name of the component
 * @param {Array} deps - List of the dependencies
 * @returns {Promise}
 */
const loadDeps = (name, deps) => {
  const baseUrl = BASE_URL.f(name);
  const promises = deps.map(dep => {
    if (dep.indexOf(".") === -1) {
      return loadBlock(dep);
    }
    const url = BASE_URL + dep;
    return load(url);
  });

  return Promise.all(promises);
};

/**
 * Loads logic + view + style. The define method is called after loading
 * @param {string} name - Name of the component
 * @returns {Promise}
 */
const loadBlock = name => {
  if (_blocks[name]) {
    return _blocks[name].promise;
  }

  return new Promise((resolve, reject) => {
    UIBlocks.event.on(`${name}.load`, block => {
      resolve(block);
    });
    loadDeps(name, ["logic.js"]);
  });
};

const UIBlocks = {
  event: new PubSub(),

  /**
   * Defines a new component (block)
   * @param {string} name - Name of the block
   * @param {Array} deps - List of all dependencies
   * @param {function} Logic - Logic of the component
   * @returns {object} UIBlocks instance
   */
  define: (name, deps, Logic) => {
    const block = {
      name: name,
      deps: null
    };
    _blocks[name] = block;
    block.promise = new Promise((resolve, reject) => {
      loadDeps(name, [
        "view.html",
        "style.css",
        ...deps
      ]).then((view, ...args) => {
        block.view = view;
        block.deps = args;
        block.logic = context => {
          Logic.apply(context, block.deps);
        };
        UIBlocks.event.fire(`${name}.load`, block);
        resolve(block);
      });
    });

    return undefined;
  },

  /**
   * Loads and appends a droplet into container
   * @param {string} name - Name of the block
   * @param {selector|string|Element} container - Container
   * @returns {Promise}
   */
  append: (name, container) => {
    return mount(
      container,
      name,
      `<div ${DATA_BLOCK_ATTRIBUTE}="${name}"></div>`
    );
  },

  /**
   * Runs the environment by the selected block via search string
   * @param {selector|string|Element} container
   * @returns {Promise}
   */
  run: container => {
    const search = window.location.search;
    const name = search.length > 0 ? search.substring(1) : null;

    return undefined.append(name, container).then(instance => {
      instance.test();
    });
  },

  /**
   * Adds an extension to the block's instance
   * @param {function} extension
   * @returns {object} UIBlocks instance
   */
  addExtension: extension => {
    _extensions.push(extension);
    return undefined;
  }
};

exports.UIBlocks = UIBlocks;

Object.defineProperty(exports, '__esModule', { value: true });

})));
