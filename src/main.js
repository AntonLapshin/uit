import { opts } from "./block";
import { PubSub } from "./pubsub";
import { load } from "./loader";
import { lookup, blocks } from "./lookup";

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
    el.innerHTML = html;
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
export const event = new PubSub();

/**
 * Observable class
 */
export { Observable } from "./observable";

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
export function append(el, name) {
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
export function run(el) {
  const search = window.location.search;
  const name = search.length > 0 ? search.substring(1) : null;

  return append(el, name).then(instances => {
    instances[0].test();
    return instances;
  });
}
