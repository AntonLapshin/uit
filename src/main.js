import { opts } from "./component";
import { PubSub } from "./pubsub";
import { load } from "./loader";
import { lookup, components } from "./lookup";

export { load } from "./loader";

/**
 * Mounts a component into DOM and looks for another components inside
 * @param {Element} el - Container
 * @param {string} name - Name of the component
 * @param {string} html - Input html string
 * @returns {Promise<Component[]>} - List of mounted components
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
  const baseUrl = opts.BASE_URL + name + "/";
  const promises = deps.map(dep => {
    if (dep.indexOf(".") === -1) {
      return loadComponent(dep);
    }
    const url = baseUrl + dep;
    return load(url);
  });

  return Promise.all(promises);
};

/**
 * Loads logic + view + style. The define method is called after loading
 * @param {string} name - Name of the component
 * @returns {Promise<object>} - Component definition
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
 * Defines a new component
 * @param {string} name - Name of the component
 * @param {Array} deps - List of all dependencies
 * @param {function} Logic - Logic of the component
 */
export function define(name, deps, Logic) {
  const component = {
    name: name,
    deps: null
  };
  components[name] = component;
  component.promise = new Promise(resolve => {
    loadDeps(name, ["view.html", "style.css", ...deps]).then(args => {
      component.view = args[0];
      component.deps = args;
      component.logic = context => {
        Logic.call(context, context, component.deps);
      };
      event.fire(`${name}.load`, component);
      resolve(component);
    });
  });
}

/**
 * Loads and appends a droplet into container
 * @param {selector|string|Element} el - Container
 * @param {string} name - Name of the component
 * @returns {Promise<Component[]>} - List of the added component instances
 */
export function append(el, name) {
  return mount(el, name, `<div ${opts.DATA_NAME_ATTRIBUTE}="${name}"></div>`);
}

/**
 * Runs the environment by a selected component via search string
 * @param {selector|string|Element} el - Container
 * @returns {Promise<Component[]>} - List of the added component instances
 */
export function run(el) {
  const search = window.location.search;
  const name = search.length > 0 ? search.substring(1) : null;

  return append(el, name).then(instance => {
    if (window.uitDebug) {
      return window.uitDebug.debug(instance);
    }
    return instance;
  });
}
