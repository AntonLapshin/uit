/**
 * TODOs: Add comments
 */
import { PubSub } from "./pubsub";
import { dataBind } from "./data-bind";

export const opts = {
  DATA_BLOCK_NAME_ATTRIBUTE: "data-block-name",
  DATA_BLOCK_READY_ATTRIBUTE: "data-block-ready",
  DATA_BLOCK_PATH_ATTRIBUTE: "data-block-path",
  DATA_BLOCK_CALL_ATTRIBUTE: "data-block-call",
  DATA_BIND_ATTRIBUTE: "data-bind",
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
    this.elAll = el.querySelectorAll(
      `*:not([${opts.DATA_BLOCK_NAME_ATTRIBUTE}])`
    );
    this.children = {};
    logic(this);
    dataBind.call(this);
  }

  /**
   * Sets data to the block instance
   * @param {object} data 
   * @returns {Block} instance
   */
  set(data) {
    this.olddata = this.data;
    this.data = data;
    this.fire("set", data, this.olddata);
    return this;
  }

  /**
   * Fires load event
   * @returns {Block} instance
   */
  load() {
    this.fire("load");
    return this;
  }

  /**
   * Shows element
   * @returns {Block} instance
   */
  show() {
    this.el.style.display = "";
    this.fire("show");
    return this;
  }

  /**
   * Hides element
   * @returns {Block} instance
   */
  hide() {
    this.el.style.display = "none";
    this.fire("hide");
    return this;
  }

  /**
   * Tests element
   * @returns {Block} instance
   */
  test() {
    this.el.style.display = "";
    this.fire("test");
    return this;
  }
}
