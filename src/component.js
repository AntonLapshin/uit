import { PubSub } from "./pubsub";
import { dataBind } from "./data-bind";

export const opts = {
  DATA_NAME_ATTRIBUTE: "data-uit-name",
  DATA_READY_ATTRIBUTE: "data-uit-ready",
  DATA_PATH_ATTRIBUTE: "data-uit-path",
  DATA_CALL_ATTRIBUTE: "data-uit-call",
  DATA_BIND_ATTRIBUTE: "data-bind",
  CALL_BY_INDEX: "byIndex",
  BASE_URL: "./components/"
};

/**
 * Component's instance implementation
 */
export class Component extends PubSub {
  /**
   * Creates a component's instance
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
    this.els = el.querySelectorAll(`*:not([${opts.DATA_NAME_ATTRIBUTE}])`);
    this.children = {};
    logic && logic(this);
    dataBind.call(this);
  }

  /**
   * Sets data to the component instance
   * @param {object} data 
   * @returns {Component} instance
   */
  set(data) {
    this.olddata = this.data;
    this.data = data;
    this.fire("set", data, this.olddata);
    return this;
  }

  /**
   * Fires load event
   * @returns {Component} instance
   */
  load() {
    this.fire("load");
    return this;
  }

  /**
   * Shows element
   * @returns {Component} instance
   */
  show() {
    this.el.style.display = "";
    this.fire("show");
    return this;
  }

  /**
   * Hides element
   * @returns {Component} instance
   */
  hide() {
    this.el.style.display = "none";
    this.fire("hide");
    return this;
  }

  /**
   * Tests element
   * @returns {Component} instance
   */
  test() {
    this.el.style.display = "";
    this.fire("test");
    return this;
  }
}
