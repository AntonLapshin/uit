'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var _uid = 0;

/**
 * Typical PubSub implementation
 */
var PubSub = function () {
  function PubSub() {
    classCallCheck(this, PubSub);

    this.handlers = {};
  }

  /**
   * Subscribes on event. Adds an event handler to a specific event.
   * @param {string} eventName 
   * @param {function} handler
   * @returns {number} _uid of the event handler
   */


  createClass(PubSub, [{
    key: "on",
    value: function on(eventName, handler) {
      if (!this.handlers.hasOwnProperty(eventName)) {
        this.handlers[eventName] = [];
      }
      var token = _uid++;
      this.handlers[eventName].push({
        token: token,
        handler: handler
      });
      return token;
    }

    /**
     * Calls the event handlers by event name
     * @param {string} eventName 
     * @param {object} args 
     * @returns {boolean} true of false if at lease one event handler exists or not
     */

  }, {
    key: "fire",
    value: function fire(eventName, arg1, arg2) {
      if (!this.handlers.hasOwnProperty(eventName)) {
        return false;
      }
      this.handlers[eventName].forEach(function (hh) {
        return hh.handler(arg1, arg2);
      });
      return true;
    }

    /**
     * Unsubscribes the event handler by token
     * @param {number} token 
     * @returns {boolean} if successfully unsubscribed
     */

  }, {
    key: "off",
    value: function off(token) {
      var _this = this;

      var _loop = function _loop(eventName) {
        var hh = _this.handlers[eventName];
        hh.forEach(function (h, i) {
          if (h.token === token) {
            hh.splice(i, 1);
            return true;
          }
        });
      };

      for (var eventName in this.handlers) {
        _loop(eventName);
      }
      return false;
    }

    /**
     * Subscribes on event only for one execution. Unsibscribes after
     * @param {string} eventName 
     * @param {function} handler 
     */

  }, {
    key: "once",
    value: function once(eventName, handler) {
      var _this2 = this;

      var token = this.on(eventName, function (args) {
        handler(args);
        _this2.off(token);
      });
    }
  }]);
  return PubSub;
}();

/**
 * TODOs: Add comments
 */
var opts = {
  DATA_BLOCK_NAME_ATTRIBUTE: "data-block-name",
  DATA_BLOCK_READY_ATTRIBUTE: "data-block-ready",
  DATA_BLOCK_PATH_ATTRIBUTE: "data-block-path",
  DATA_BLOCK_CALL_ATTRIBUTE: "data-block-call",
  CALL_BY_INDEX: "byIndex",
  BASE_URL: "./blocks/"
};

/**
 * Block's instance implementation
 */
var Block = function (_PubSub) {
  inherits(Block, _PubSub);

  /**
   * Creates a block's instance
   * @param {string} name Name of the component
   * @param {string} path The full path of the component
   * @param {Element} el DOM element
   * @param {function} logic Custom logic of the component
   */
  function Block(name, path, el, logic) {
    classCallCheck(this, Block);

    var _this = possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).call(this));

    _this.name = name;
    _this.path = path;
    _this.el = el;
    _this.elAll = el.querySelector("*:not('[" + opts.DATA_BLOCK_NAME_ATTRIBUTE + "]')");
    _this.children = {};
    logic(_this);
    return _this;
  }

  createClass(Block, [{
    key: "set",
    value: function set$$1(data) {
      this.fire("set", data);
      this.olddata = this.data;
      this.data = data;
      return this;
    }
  }, {
    key: "load",
    value: function load() {
      this.fire("load");
      return this;
    }
  }, {
    key: "show",
    value: function show() {
      this.el.style.display = "";
      this.fire("show");
      return this;
    }
  }, {
    key: "hide",
    value: function hide() {
      this.el.style.display = "none";
      this.fire("hide");
      return this;
    }
  }, {
    key: "test",
    value: function test() {
      this.el.style.display = "none";
      this.fire("test");
      return this;
    }
  }]);
  return Block;
}(PubSub);

/**
 * Typical implementation of the Observable variables
 */

var ObservableValue = function (_PubSub) {
  inherits(ObservableValue, _PubSub);

  function ObservableValue(data) {
    classCallCheck(this, ObservableValue);

    var _this = possibleConstructorReturn(this, (ObservableValue.__proto__ || Object.getPrototypeOf(ObservableValue)).call(this));

    _this.data = data;
    return _this;
  }

  createClass(ObservableValue, [{
    key: "update",
    value: function update(data) {
      this.olddata = this.data;
      this.data = data;
      return this.fire();
    }
  }, {
    key: "fire",
    value: function fire() {
      return get(ObservableValue.prototype.__proto__ || Object.getPrototypeOf(ObservableValue.prototype), "fire", this).call(this, "update", this.data, this.olddata);
    }
  }, {
    key: "on",
    value: function on(h) {
      return get(ObservableValue.prototype.__proto__ || Object.getPrototypeOf(ObservableValue.prototype), "on", this).call(this, "update", h);
    }
  }]);
  return ObservableValue;
}(PubSub);

var Observable = function Observable(data) {
  var value = new ObservableValue(data);

  var ObservableBehavior = function ObservableBehavior(data) {
    if (data === undefined) {
      return value.data;
    }
    value.update(data);
    return ObservableBehavior;
  };

  ObservableBehavior.on = function (h) {
    return value.on(h);
  };
  ObservableBehavior.off = function (token) {
    return value.off(token);
  };

  return ObservableBehavior;
};

var loadImage = function loadImage(url, resolve) {
  var img = new Image();
  img.onload = function () {
    resolve(img);
  };
  img.src = url;
};

var loadStyle = function loadStyle(url, resolve) {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
  resolve(link);
};

var loadScript = function loadScript(url, resolve) {
  var script = document.createElement("script");
  script.type = "text/javascript";

  if (script.readyState) {
    // IE
    script.onreadystatechange = function () {
      if (script.readyState == "loaded" || script.readyState == "complete") {
        script.onreadystatechange = null;
        resolve();
      }
    };
  } else {
    // Others
    script.onload = function () {
      resolve(script);
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};

var loadView = function loadView(url, resolve) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (this.readyState !== 4 || this.status !== 200) {
      return;
    }
    resolve(this.responseText);
  };
  xhr.send();
};

var TIMEOUT = 3000;
var LOADERS = [{
  type: "image",
  load: loadImage,
  ext: /\b(png|jpg|gif)\b/
}, {
  type: "style",
  load: loadStyle,
  ext: /\b(css)\b/
}, {
  type: "script",
  load: loadScript,
  ext: /\b(js)\b/
}, {
  view: "view",
  load: loadView,
  ext: /\b(html)\b/
}];

/**
 * Loads an external resource
 * @param {string} url - URL of the the external resource
 * @returns {Promise}
 */
var load = function load(url) {
  var ext = url.split(".").pop();
  var loader = LOADERS.find(function (l) {
    return l.ext.test(ext);
  });
  return new Promise(function (resolve) {
    if (!loader) {
      throw "Loader for <" + ext + "> files has not been implemented";
    }
    if (!loader.cache) {
      loader.cache = {};
    }
    loader.load(url, function (res) {
      loader.cache[url] = res;
      resolve(res);
    });
    setTimeout(function () {
      if (loader.cache[url]) {
        return;
      }
      loader.cache[url] = true;
      resolve(true);
    }, TIMEOUT);
  });
};

var combinePath = function combinePath(parentPath, name) {
  return "" + (parentPath ? parentPath + "+" : "") + name;
};
var matches = function matches(el, selector) {
  return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
};
var findAncestor = function findAncestor(el, selector) {
  while ((el = el.parentElement) && !matches(el, selector)) {}
  return el;
};

var blocks = {};
var _instances = {};

/**
 * Builds a block based on element. Creates a new block instance
 * @param {Element} el Block element
 * @returns {Promise}
 */
var build = function build(el) {
  return new Promise(function (resolve) {
    var name = el.getAttribute(opts.DATA_BLOCK_NAME_ATTRIBUTE);
    var block = blocks[name];
    if (!block.view) {
      throw "View of " + name + " droplet is undefined";
    }

    var parentEl = findAncestor(el, "[" + opts.DATA_BLOCK_NAME_ATTRIBUTE + "]");
    var parentPath = parentEl.getAttribute(opts.DATA_BLOCK_PATH_ATTRIBUTE);
    var call = el.getAttribute(opts.DATA_BLOCK_CALL_ATTRIBUTE);
    var path = combinePath(parentPath, name);

    if (parentEl && parentPath) {
      var parentBlock = _instances[parentPath];
      if (call === opts.CALL_BY_INDEX) {
        if (!parentBlock.children[name]) {
          parentBlock.children[name] = [];
        }
        var index = parentBlock.children[name].length;
        path += "[" + index + "]";
      } else if (typeof call === "string") {
        if (!parentBlock.children[name]) {
          parentBlock.children[name] = {};
        }
        path += "[" + call + "]";
      }
    }

    el.classList.add(name);
    el.addAttribute(opts.DATA_BLOCK_READY_ATTRIBUTE, true);
    el.addAttribute(opts.DATA_BLOCK_PATH_ATTRIBUTE, path);
    el.innerHTML = block.view;

    var blockInstance = new Block(name, path, el, block.logic);
    _instances[path] = blockInstance;

    if (parentEl && parentPath) {
      var _parentBlock = _instances[parentPath];
      if (call === opts.CALL_BY_INDEX) {
        _parentBlock.children[name].push(blockInstance);
      } else if (call) {
        _parentBlock.children[name][call] = blockInstance;
      } else {
        _parentBlock.children[name] = blockInstance;
      }
      blockInstance.parent = _parentBlock;
    }

    lookup(el).then(function () {
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
var lookup = function lookup(el) {
  var els = el.querySelector("[" + opts.DATA_BLOCK_ATTRIBUTE + "]:not([" + opts.DATA_BLOCK_READY_ATTRIBUTE + "]");

  if (els.length === 0) {
    return new Promise(function (resolve) {
      resolve();
    });
  }

  var promises = Array.prototype.map.call(els, function (el) {
    return build(el);
  });
  return Promise.all(promises);
};

var _extensions = [];

/**
 * Mounts a block into DOM and looks for another blocks inside
 * @param {Element} el - Container
 * @param {string} name - Name of the component
 * @param {string} html - Input html string
 * @returns {Promise}
 * @ignore
 */
var mount = function mount(el, name, html) {
  if (el instanceof Element !== true) {
    throw "el is not an Element instance";
  }
  return loadBlock(name).then(function () {
    el.innerHTML = html;
    return lookup(el);
  });
};

/**
 * Loads all component's dependencies
 * @param {string} name - Name of the component
 * @param {Array} deps - List of the dependencies
 * @returns {Promise}
 * @ignore
 */
var loadDeps = function loadDeps(name, deps) {
  var baseUrl = opts.BASE_URL + "/" + name;
  var promises = deps.map(function (dep) {
    if (dep.indexOf(".") === -1) {
      return loadBlock(dep);
    }
    var url = baseUrl + dep;
    return load(url);
  });

  return Promise.all(promises);
};

/**
 * Loads logic + view + style. The define method is called after loading
 * @param {string} name - Name of the component
 * @returns {Promise}
 * @ignore
 */
var loadBlock = function loadBlock(name) {
  if (blocks[name]) {
    return blocks[name].promise;
  }

  return new Promise(function (resolve) {
    event.on(name + ".load", function (block) {
      resolve(block);
    });
    loadDeps(name, ["logic.js"]);
  });
};

/**
 * PubSub instance
 */
var event = new PubSub();

/**
 * Observable class
 */
var ob = Observable;

/**
 * Defines a new component (block)
 * @param {string} name - Name of the block
 * @param {Array} deps - List of all dependencies
 * @param {function} Logic - Logic of the component
 */
function define(name, deps, Logic) {
  var block = {
    name: name,
    deps: null
  };
  blocks[name] = block;
  block.promise = new Promise(function (resolve) {
    loadDeps(name, ["view.html", "style.css"].concat(toConsumableArray(deps))).then(function (view) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      block.view = view;
      block.deps = args;
      block.logic = function (context) {
        Logic.apply(context, block.deps);
      };
      event.fire(name + ".load", block);
      resolve(block);
    });
  });
}

/**
 * Loads and appends a droplet into container
 * @param {string} name - Name of the block
 * @param {selector|string|Element} container - Container
 * @returns {Promise}
 */
function append(name, container) {
  return mount(container, name, "<div " + opts.DATA_BLOCK_NAME_ATTRIBUTE + "=\"" + name + "\"></div>");
}

/**
 * Runs the environment by the selected block via search string
 * @param {selector|string|Element} container
 * @returns {Promise}
 */
function run(container) {
  var search = window.location.search;
  var name = search.length > 0 ? search.substring(1) : null;

  return this.append(name, container).then(function (instance) {
    instance.test();
  });
}

/**
 * Adds an extension to the block's instance
 * @param {function} extension
 * @returns {object} uit instance
 */
function addExtension(extension) {
  _extensions.push(extension);
}

exports.event = event;
exports.ob = ob;
exports.define = define;
exports.append = append;
exports.run = run;
exports.addExtension = addExtension;
