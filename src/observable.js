/**
 * Typical implementation of the Observable variables
 */
import { PubSub } from "./pubsub";

class ObservableValue extends PubSub {
  constructor(data) {
    super();
    this.data = data;
  }

  update(data) {
    this.olddata = this.data;
    this.data = data;
    return this.fire();
  }

  fire() {
    return super.fire("update", this.data, this.olddata);
  }

  on(h) {
    return super.on("update", h);
  }
}

export const Observable = data => {
  const value = new ObservableValue(data);

  const ObservableBehavior = data => {
    if (data === undefined) {
      return value.data;
    }
    value.update(data);
    return ObservableBehavior;
  };

  /**
   * Subscribes on variable's changes
   * @param {function} handler - Event Handler
   * @returns {number} - token
   */
  ObservableBehavior.on = h => {
    return value.on(h);
  };
  /**
   * Unsubscribes from variable's changes
   * @param {number} token - Token for unsubscribe
   * @returns {boolean} - Result
   */
  ObservableBehavior.off = token => {
    return value.off(token);
  };

  return ObservableBehavior;
};
