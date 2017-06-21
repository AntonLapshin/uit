let uid = -1;

/**
 * Typical PubSub implementation
 */
export class PubSub {
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
