import should from "should";
import { Block } from "./block";

global.Element = function() {
  return {
    querySelector: () => {
      return new Element();
    },
    style: {
      display: ""
    }
  };
};
describe("Block", () => {
  it("set", done => {
    const blockInstance = new Block("test", "test", new Element(), ctx => {
      ctx.version = 1;
    });
    blockInstance.on("set", (data, olddata) => {
      data.should.be.equal(1);
      should.not.exist(olddata);
      blockInstance.version.should.be.equal(1);
      done();
    });
    blockInstance.set(1);
  });

  it("load", done => {
    const blockInstance = new Block("test", "test", new Element(), ctx => {
      ctx.version = 1;
    });
    blockInstance.on("load", () => {
      should.not.exist(blockInstance.data);
      done();
    });
    blockInstance.load();
  });

  it("hide", () => {
    const blockInstance = new Block("test", "test", new Element(), ctx => {
      ctx.version = 1;
    });
    blockInstance.el.style.display.should.be.equal("");
    blockInstance.hide();
    blockInstance.el.style.display.should.be.equal("none");
  });

  it("show", () => {
    const blockInstance = new Block("test", "test", new Element(), ctx => {
      ctx.version = 1;
    });
    blockInstance.hide();
    blockInstance.show();
    blockInstance.el.style.display.should.be.equal("");
  });

  it("test", () => {
    const blockInstance = new Block("test", "test", new Element(), ctx => {
      ctx.version = 1;
    });
    blockInstance.test();
    blockInstance.el.style.display.should.be.equal("none");
  });
});
