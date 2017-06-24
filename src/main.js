import { opts } from "./block";
import { PubSub } from "./pubsub";
import { Observable } from "./observable";
import { load } from "./loader";
import { lookup, blocks } from "./lookup";

/**
 * Mounts a block into DOM and looks for another blocks inside
 * @param {Element} el - Container
 * @param {string} name - Name of the component
 * @param {string} html - Input html string
 * @returns {Promise}
 * @ignore
 */
const mount = (el, name, html) => {
  if (el instanceof Element !== true) {
    throw "el is not an Element instance";
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
 * @ignore
 */
const loadDeps = (name, deps) => {
  const baseUrl = opts.BASE_URL + "/" + name;
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
 * @returns {Promise}
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
export const event = new PubSub();

/**
 * Observable class
 */
export const ob = Observable;

/**
 * Defines a new component (block)
 * @param {string} name - Name of the block
 * @param {Array} deps - List of all dependencies
 * @param {function} Logic - Logic of the component
 */
export function define(name, deps, Logic) {
  const block = {
    name: name,
    deps: null
  };
  blocks[name] = block;
  block.promise = new Promise(resolve => {
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
      event.fire(`${name}.load`, block);
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
export function append(name, container) {
  return mount(
    container,
    name,
    `<div ${opts.DATA_BLOCK_NAME_ATTRIBUTE}="${name}"></div>`
  );
}

/**
 * Runs the environment by the selected block via search string
 * @param {selector|string|Element} container
 * @returns {Promise}
 */
export function run(container) {
  const search = window.location.search;
  const name = search.length > 0 ? search.substring(1) : null;

  return this.append(name, container).then(instance => {
    instance.test();
  });
}
