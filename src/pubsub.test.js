import should from "should";
import { PubSub } from "./pubsub";

class Item extends PubSub {
  update() {
    return this.fire("update");
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
    count.should.be.equal(1);
    done();
  });

  it("off", function(done) {
    const item = new Item();
    let count = 0;
    const token = item.on("update", () => {
      count++;
    });
    item.update();
    item.off(token);
    item.update();
    count.should.be.equal(1);
    done();
  });

  it("once", function(done) {
    const item = new Item();
    let count = 0;
    item.once("update", () => {
      count++;
    });
    item.update();
    item.update();
    count.should.be.equal(1);
    done();
  });

  it("no event handlers", () => {
    const item = new Item();
    const result = item.update();
    result.should.be.equal(false);
  });
});
