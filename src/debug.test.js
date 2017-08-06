import should from "should";
import { define, run } from "./main";
import { debug } from "./debug";
// import helper from "./test.helper";
require("jsdom-global")();

describe("Debug", () => {
  it("debug", done => {
    define("test", "<div></div>", ctx => {
      ctx.version = 1;
    });
    const el = document.createElement("div");
    run(el, "test").then(debug).then(instance => {
      should.exist(instance);
      done();
    });
  });
});
