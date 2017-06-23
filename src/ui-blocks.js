import { Block, DATA_BLOCK_ATTRIBUTE } from "./block";
import { PubSub } from "./pubsub";
import { Observable } from "./observable";
import { load } from "./loader";

const BASE_URL = "./blocks/{0}/";
const getPath = (parentPath, name) => {
  return `${parentPath ? parentPath + "+" : ""}${name}`;
};
const _blocks = {};

function build($droplet) {
  var defer = $.Deferred();

  var dropletName = $droplet.attr(DATA_BLOCK_ATTRIBUTE);
  var droplet = _droplets[dropletName];
  if (!droplet.view) throw "View of {0} droplet is undefined".f(dropletName);

  var $parent = $droplet.parents(`[${DATA_BLOCK_ATTRIBUTE}]`).eq(0);
  var parentName = $parent.attr("data-name");
  var dropletCall = $droplet.attr("data-call");
  var name = getName(parentName, dropletName);
  var parent, index;

  if (parentName) {
    parent = _instances[parentName];
    if (dropletCall === "byIndex") {
      if (!parent.children[dropletName]) parent.children[dropletName] = [];
      index = parent.children[dropletName].length;
      name += "[{0}]".f(index);
    } else if (typeof dropletCall === "string") {
      if (!parent.children[dropletName]) parent.children[dropletName] = {};
      name += "[{0}]".f(dropletCall);
    }
  }

  $droplet
    .addClass(dropletName)
    .attr("data-ready", true)
    .attr("data-name", name)
    .html(droplet.view);

  var instance = new Instance(dropletName, name, droplet.constructor, $droplet);
  _instances[name] = instance;

  if (parentName) {
    var parent = _instances[parentName];
    if (index !== undefined) {
      parent.children[dropletName].push(instance);
    } else if (dropletCall) {
      parent.children[dropletName][dropletCall] = instance;
    } else {
      parent.children[dropletName] = instance;
    }
    instance.parent = parent;
  }

  lookup($droplet).then(function() {
    instance.load();
    defer.resolve(instance);
  });

  return defer;
}

//
// Lookup for droplet inside of the container
//
function lookup($container) {
  $container = $container || $("body");
  var $droplets = $container.find("[data-droplet]").not("[data-ready]");

  if ($droplets.length === 0) {
    var defer = $.Deferred();
    defer.resolve();
    return defer;
  }

  var defers = [];
  $droplets.each(function() {
    var $droplet = $(this);
    defers.push(build($droplet));
  });

  return $.when.apply(this, defers);
}

/**
 * 
 * @param {Element} el - Container
 * @param {string} name - Name of the component
 * @param {string} html - Input html string
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
  return new Promise((resolve, reject) => {
    if (!deps || deps.length === 0) {
      resolve();
      return;
    }
    const baseUrl = BASE_URL.f(name);
  });

  var defers = [];
  $.each(deps, function(i, dep) {
    var oldUrl = url;
    var url = baseUrl + dep;

    if (url.endsWith(".jpg") || url.endsWith("png"))
      defers.push(loadImage(oldUrl));
    else if (url.endsWith(".html")) defers.push(loadView(url, name));
    else if (url.endsWith(".css")) defers.push(loadStyle(url));
    else if (url.endsWith(".js")) defers.push(loadScript(url));
    else defers.push(loadDroplet(url.split("/").pop()));
  });

  return $.when.apply(this, defers);
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

export const UIBlocks = {
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
        block.constructor = context => {
          Logic.apply(context, block.deps);
        };
        UIBlocks.event.fire(`${name}.load`, block);
        resolve(block);
      });
    });

    return this;
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

    return this.append(name, container).then(instance => {
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
    return this;
  }
};
