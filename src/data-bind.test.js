import should from "should";
import { dataBind } from "./data-bind";
import { Component, opts } from "./component";
import { proxy } from "proxy-observable";
import { helper } from "./test.helper";

describe("Data-binding", () => {
  it("src", () => {
    const kid = new Element("kid", []);
    kid.setAttribute(opts.DATA_BIND_ATTRIBUTE, "src: data.inner.src");
    const el = new Element("test", [kid]);
    const instance = new Component("test", null, el);
    dataBind.call(instance);
    should.not.exist(kid.getAttribute("src"));
    instance.set({ inner: proxy({ src: "resource/test.png" }) });
    kid.getAttribute("src").should.be.equal("resource/test.png");
    instance.data.inner.src = "2";
    kid.getAttribute("src").should.be.equal("2");
  });
});
