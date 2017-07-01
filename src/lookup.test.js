import should from "should";
import {
  lookup,
  components,
  instances,
  adjustPath,
  adjustParentChildren
} from "./lookup";
import helper from "./test.helper";

describe("Lookup", () => {
  it("adjustPath", () => {
    const parentPath = "root+parent";
    instances[parentPath] = {
      children: []
    };
    let path = adjustPath(null, parentPath, "button");
    path.should.be.equal("root+parent+button");

    path = adjustPath(true, parentPath, "button");
    path.should.be.equal("root+parent+button");

    path = adjustPath(true, parentPath, "button", "test1");
    path.should.be.equal("root+parent+button[test1]");
    should.exist(instances[parentPath].children.button);

    path = adjustPath(true, parentPath, "button", "test2");
    path.should.be.equal("root+parent+button[test2]");
    should.exist(instances[parentPath].children.button);

    path = adjustPath(true, parentPath, "input", "byIndex");
    path.should.be.equal("root+parent+input[0]");
    should.exist(instances[parentPath].children.input);

    path = adjustPath(true, parentPath, "input", "byIndex");
    path.should.be.equal("root+parent+input[0]");
    should.exist(instances[parentPath].children.input);
  });

  it("adjustParentChildren", () => {
    const parentPath = "root+parent";
    instances[parentPath] = {
      children: {
        button: {},
        input: []
      }
    };
    adjustParentChildren(null);

    const instance = { parent: null };

    adjustParentChildren(true, "button", parentPath, "test1", instance);
    instance.parent.should.be.equal(instances[parentPath]);
    instances[parentPath].children.button.test1.should.be.equal(instance);

    adjustParentChildren(true, "input", parentPath, "byIndex", instance);
    instance.parent.should.be.equal(instances[parentPath]);
    instances[parentPath].children.input[0].should.be.equal(instance);
  });

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
