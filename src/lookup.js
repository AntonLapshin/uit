import { Component, opts } from "./component";

const combinePath = (parentPath, name) => {
  return `${parentPath}+${name}`;
};
const findAncestor = (el, selector) => {
  while ((el = el.parentElement) && !el.matches(selector));
  return el;
};

export const components = {};
const _instances = {};

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
    let path = combinePath(parentPath, name);

    if (parentEl) {
      const parentInstance = _instances[parentPath];
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

    el.classList.add(`_${name}`);
    el.setAttribute(opts.DATA_READY_ATTRIBUTE, true);
    el.setAttribute(opts.DATA_PATH_ATTRIBUTE, path);
    el.innerHTML = component.view;

    const instance = new Component(name, path, el, component.logic);
    _instances[path] = instance;

    if (parentEl && parentPath) {
      const parentInstance = _instances[parentPath];
      if (call === opts.CALL_BY_INDEX) {
        parentInstance.children[name].push(instance);
      } else if (call) {
        parentInstance.children[name][call] = instance;
      } else {
        parentInstance.children[name] = instance;
      }
      instance.parent = parentInstance;
    }

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
export const lookup = el => {
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
