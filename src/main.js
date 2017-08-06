import { opts } from "./component";
import { PubSub } from "./pubsub";
import { load } from "./loader";
import { lookup, components } from "./lookup";

export { load } from "./loader";

/**
 * Mounts a component into DOM and looks for another components inside
 * @param {Element} el - Container
 * @param {string} path - Path to the component
 * @param {string} html - Input html string
 * @returns {Promise<Component[]>} - List of mounted components
 * @ignore
 */
const mount = (el, path, html) => {
  if (el instanceof Element !== true) {
    throw "el is not an Element instance";
  }
  return loadComponent(path).then(() => {
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
 * @param {string} folder - Folder of the component
 * @param {Array} deps - List of the dependencies
 * @returns {Promise<object[]>} - List of the loaded dependencies
 * @ignore
 */
const loadDeps = (name, folder, deps) => {
  const baseUrl = opts.BASE_URL + folder;
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
 * @param {string} path - Path to the component
 * @returns {Promise<object>} - Component definition
 * @ignore
 */
const loadComponent = path => {
  const p = path.split("/");
  const fname = p.pop();
  const name = fname.split(".")[0];
  if (components[name]) {
    return components[name].promise;
  }

  return new Promise(resolve => {
    event.on(`${name}.load`, component => {
      resolve(component);
    });
    loadDeps(name, p.join("/"), [fname]);
  });
};

/**
 * PubSub instance
 */
export const event = new PubSub();

/**
 * Defines a new component
 * @param {string} name - Name of the component
 * @param {string} view - [Optional] HTML View
 * @param {string} style - [Optional] CSS
 * @param {Array<string>} deps - [Optional] List of all dependencies (urls)
 * @param {function} Logic - Logic of the component
 */
export function define(...args) {
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
    loadDeps(name, "", deps).then(res => {
      if (!view) {
        component.view = res[0];
      }
      component.deps = res;
      if (Logic) {
        component.logic = context => {
          Logic.call(context, context, component.deps);
        };
      }
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
  return mount(el, name, `<div ${opts.DATA_NAME_ATTRIBUTE}="${name.split('.')[0]}"></div>`);
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
