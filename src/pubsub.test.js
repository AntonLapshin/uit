import should from "should";
import { PubSub } from "./pubsub";

class Item extends PubSub {
  update() {
    this.fire("update");
  }
}

describe("PubSub", function() {
  it("on", function(done) {
    const item = new Item();
    let count = 0;
    item.on("update", () => {
      count++;
    });
    item.update();
    setTimeout(() => {
      count.should.be.equal(1);
      done();
    }, 1);
  });

  it("off", function(done) {
    const item = new Item();
    let count = 0;
    const token = item.on("update", () => {
      count++;
    });
    item.off(token);
    item.update();
    setTimeout(() => {
      count.should.be.equal(0);
      done();
    }, 1);
  });

  it("once", function(done) {
    const item = new Item();
    let count = 0;
    item.once("update", () => {
      count++;
    });
    item.update();
    item.update();
    setTimeout(() => {
      count.should.be.equal(1);
      done();
    }, 1);
  });
});
