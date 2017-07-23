import should from "should";
import { define, run } from "./main";
import { debug } from "./debug";
import helper from "./test.helper";

describe("Debug", () => {
  it("debug", done => {
    define("test", ["view.html", "style.css"], ctx => {
      ctx.version = 1;
    });
    const el = new Element(undefined, []);
    window.location.search = "?test";
    run(el).then(debug).then(instance => {
      should.exist(instance);
      done();
    });
  });
});
