import should from "should";
import { dataBind } from "./data-bind";
import { Component, opts } from "./component";
import { Observable } from "./observable";
import { helper } from "./test.helper";

describe("Data-binding", () => {
  it("src", () => {
    const kid = new Element("kid", []);
    kid.setAttribute(opts.DATA_BIND_ATTRIBUTE, "src: src");
    const el = new Element("test", [kid]);
    const instance = new Component("test", null, el, ctx => {
      ctx.src = new Observable();
    });
    dataBind.call(instance);
    should.not.exist(kid.getAttribute("src"));
    instance.src("resource/test.png");
    kid.getAttribute("src").should.be.equal("resource/test.png");
  });
});
