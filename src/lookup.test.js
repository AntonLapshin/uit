import should from "should";
import { lookup, components } from "./lookup";
import helper from "./test.helper";

describe("Lookup", () => {
  it("build", done => {
    components["test"] = {
      view: "<div></div>",
      logic: ctx => {
        ctx.version = 1;
      }
    };

    const el = new Element(undefined, [new Element("test", [])]);

    lookup(el).then(instance => {
      instance.version.should.be.equal(1);
      done();
    });
  });

  it("nested components", done => {
    components["child"] = {
      view: "<div></div>",
      logic: ctx => {
        ctx.type = "child";
      }
    };
    components["parent"] = {
      view: "<div><span data-uit-name='child'></span></div>",
      logic: ctx => {
        ctx.type = "parent";
      }
    };

    const el = new Element(undefined, [new Element("parent", [])]);
    lookup(el).then(instance => {
      instance.type.should.be.equal("parent");
      instance.children.child.type.should.be.equal("child");
      done();
    });
  });
});
