import should from "should";
import { Component } from "./component";
import helper from "./test.helper";

describe("Component", () => {
  it("set", done => {
    const instance = new Component("test", "test", new Element(), ctx => {
      ctx.version = 1;
    });
    instance.on("set", (data, olddata) => {
      data.should.be.equal(1);
      should.not.exist(olddata);
      instance.version.should.be.equal(1);
      done();
    });
    instance.set(1);
  });

  it("load", done => {
    const instance = new Component("test", "test", new Element(), ctx => {
      ctx.version = 1;
    });
    instance.on("load", () => {
      should.not.exist(instance.data);
      done();
    });
    instance.load();
  });

  it("hide", () => {
    const instance = new Component("test", "test", new Element(), ctx => {
      ctx.version = 1;
    });
    instance.el.style.display.should.be.equal("");
    instance.hide();
    instance.el.style.display.should.be.equal("none");
  });

  it("show", () => {
    const instance = new Component("test", "test", new Element(), ctx => {
      ctx.version = 1;
    });
    instance.hide();
    instance.show();
    instance.el.style.display.should.be.equal("");
  });

  it("test", () => {
    const instance = new Component("test", "test", new Element(), ctx => {
      ctx.version = 1;
    });
    instance.test();
    instance.el.style.display.should.be.equal("");
  });
});
