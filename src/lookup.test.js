import should from "should";
import { lookup, blocks } from "./lookup";
import helper from "./test.helper";

describe("Lookup", () => {
  it("build", done => {
    blocks["test"] = {
      view: "<div></div>",
      logic: ctx => {}
    };
    blocks["kid1"] = {
      view: "<input />",
      logic: ctx => {}
    };
    blocks["kid2"] = {
      view: "<button></button>",
      logic: ctx => {}
    };

    const el = new Element("test", [
      new Element("kid1", []),
      new Element("kid2", [])
    ]);

    lookup(el).then(blockInstance => {
      should.exist(blockInstance);
      done();
    });
  });
});
