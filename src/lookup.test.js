import should from "should";
import { lookup, blocks } from "./lookup";
import helper from "./test.helper";

describe("Lookup", () => {
  it("build", done => {
    blocks["test"] = {
      view: "<div></div>",
      logic: ctx => {
        ctx.version = 1;
      }
    };

    const el = new Element(undefined, [new Element("test", [])]);

    lookup(el).then(blockInstances => {
      blockInstances[0].version.should.be.equal(1);
      done();
    });
  });
});
