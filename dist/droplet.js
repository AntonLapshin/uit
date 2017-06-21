(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.lib = global.lib || {})));
}(this, (function (exports) { 'use strict';

let uid = -1;

/**
 * Typical PubSub implementation
 */
class PubSub {
  constructor() {
    this.handlers = {};
  }

  /**
   * Subscribes on event. Adds an event handler to a specific event.
   * @param {string} eventName 
   * @param {function} handler
   * @returns {number} uid of the event handler
   */
  on(eventName, handler) {
    if (!this.handlers.hasOwnProperty(eventName)) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push({
      token: ++uid,
      handler
    });
    return token;
  }

  /**
   * Calls the event handlers by event name
   * @param {string} eventName 
   * @param {object} args 
   * @returns {boolean} true of false if at lease one event handler exists or not
   */
  fire(eventName, args) {
    if (!this.handlers.hasOwnProperty(eventName)) {
      return false;
    }
    setTimeout(() => {
      this.handlers[eventName].forEach(hh => hh.handler(args));
    }, 0);
    return true;
  }

  /**
   * Unsubscribes the event handler by token
   * @param {number} token 
   * @returns {boolean} if successfully unsubscribed
   */
  off(token) {
    for (const hh in this.handlers) {
      hh.forEach((h, i) => {
        if (h.token === token) {
          hh.splice(i, 1);
          return true;
        }
      });
    }
    return false;
  }

  /**
   * Subscribes on event only for one execution. Unsibscribes after
   * @param {string} eventName 
   * @param {function} handler 
   */
  once(eventName, handler) {
    const token = this.on(eventName, args => {
      handler(args);
      this.off(token);
    });
  }
}

/**
 * Component instance implementation
 */
class Instance extends PubSub {
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
    this.elAll = el.querySelector("*:not('[data-droplet]')");
    this.children = {};
  }

  set(data) {}
}

exports.Instance = Instance;

Object.defineProperty(exports, '__esModule', { value: true });

})));
