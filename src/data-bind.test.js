import should from "should";
import { dataBind } from "./data-bind";
import { Component, opts } from "./component";
import observable from "proxy-observable";
require("jsdom-global")();

describe("Data-binding", () => {
  it("src", () => {
    const kid = document.createElement("div");
    kid.setAttribute(opts.DATA_BIND_ATTRIBUTE, "src: data.inner.src");
    const parent = document.createElement("div");
    parent.setAttribute(opts.DATA_NAME_ATTRIBUTE, "parent");
    parent.appendChild(kid);

    const instance = new Component("test", null, parent);
    dataBind.call(instance);
    should.not.exist(kid.getAttribute("src"));
    instance.set({ inner: observable({ src: "resource/test.png" }) });
    kid.getAttribute("src").should.be.equal("resource/test.png");
    instance.data.inner.src = "2";
    kid.getAttribute("src").should.be.equal("2");
  });

  it("rule doesn't exist", () => {
    const kid = document.createElement("div");
    const rule = "xxx";
    kid.setAttribute(opts.DATA_BIND_ATTRIBUTE, `${rule}: data.inner.src`);
    const parent = document.createElement("div");
    parent.setAttribute(opts.DATA_NAME_ATTRIBUTE, "parent");
    parent.appendChild(kid);    
    should.throws(() => {
      const instance = new Component("test", null, parent);
    });
  });
});
