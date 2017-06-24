import should from "should";
import { dataBind } from "./data-bind";
import { Block, opts } from "./block";
import { Observable } from "./observable";
import { helper } from "./test.helper";

describe("Data-binding", () => {
  it("src", () => {
    const kid = new Element("kid", []);
    kid.setAttribute(opts.DATA_BIND_ATTRIBUTE, "src: src");
    const el = new Element("test", [kid]);
    const block = new Block("test", null, el, ctx => {
      ctx.src = new Observable();
    });
    dataBind.call(block);
    should.not.exist(kid.getAttribute("src"));
    block.src("resource/test.png");
    kid.getAttribute("src").should.be.equal("resource/test.png");
  });
});
