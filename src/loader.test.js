import should from "should";
import { load } from "./loader";
import helper from "./test.helper";

describe("Loader", () => {
  it("image", done => {
    load("resources/test.jpg").then(img => {
      img.should.be.instanceof(Image);
      done();
    });
  });

  it("view", done => {
    load("resources/test.html").then(view => {
      view.should.be.equal("<div></div>");
      done();
    });
  });

  it("style", done => {
    load("resources/test.css").then(link => {
      link.should.be.not.equal(null);
      done();
    });
  });

  it("script", done => {
    load("resources/test.js").then(js => {
      js.should.be.not.equal(null);
      done();
    });
  });

  it("should throw an exception: not implemented", done => {
    load("resources/test.jsx").catch(() => {
      done();
    });
  });

  it("timeout", done => {
    class Image2 {
      constructor() {}
    }
    global.Image = Image2;
    load("resources/test.png").then(res => {
      res.should.be.equal(true);
      done();
    });
  });
});
