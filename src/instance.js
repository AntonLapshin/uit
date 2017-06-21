import { PubSub } from "./pubsub";

/**
 * Component's instance implementation
 */
export class Instance extends PubSub {
  /**
   * Creates a component instance
   * @param {string} name Name of the component
   * @param {*} path The full path of the component
   * @param {*} el DOM element
   */
  constructor(name, path, el) {
    super();
    this.name = name;
    this.path = path;
    this.el = el;
    this.elAll = el.querySelector("*:not('[data-droplet]')");
    this.children = {};
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
  }

  hide() {
    this.el.style.display = "none";
    this.fire("hide");
  }

  test() {
    this.el.style.display = "none";
    this.fire("test");
    return this;
  }
}
