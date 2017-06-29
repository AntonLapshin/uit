import should from "should";
import { lookup, blocks } from "./lookup";
import helper from "./test.helper";

describe("Lookup", () => {
  // it("build", done => {
  //   blocks["test"] = {
  //     view: "<div></div>",
  //     logic: ctx => {
  //       ctx.version = 1;
  //     }
  //   };

  //   const el = new Element(undefined, [new Element("test", [])]);

  //   lookup(el).then(blockInstances => {
  //     blockInstances[0].version.should.be.equal(1);
  //     done();
  //   });
  // });

  it("nested components", done => {
    blocks["child"] = {
      view: "<div></div>",
      logic: ctx => {
        ctx.type = "child";
      }
    };
    blocks["parent"] = {
      view: "<div><span data-block-name='child'></span></div>",
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
