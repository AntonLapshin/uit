/**
 * TODOs: Add comments
 */
import { PubSub } from "./pubsub";

export const opts = {
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
export class Block extends PubSub {
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
    return this;
  }

  hide() {
    this.el.style.display = "none";
    this.fire("hide");
    return this;
  }

  test() {
    this.el.style.display = "none";
    this.fire("test");
    return this;
  }
}
