import { Block, opts } from "./block";

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

/**
 * Builds a block based on element. Creates a new block instance
 * @param {Element} el Block element
 * @returns {Promise}
 */
export const build = el => {
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
};

/**
 * Lookup for blocks inside of the container
 * @param {Element} el Container
 * @returns {Promise}
 */
export const lookup = el => {
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
};
