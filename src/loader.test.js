import should from "should";
import { load } from "./loader";

class Image {
  constructor() {
    setTimeout(() => {
      this.onload();
    }, 1);
  }
}

class XMLHttpRequest {
  open() {}
  send() {
    this.responseText = "<div></div>";
    this.readyState = 4;
    this.status = 200;
    this.onreadystatechange();
  }
}

global.Image = Image;
global.XMLHttpRequest = XMLHttpRequest;
global.document = {
  createElement: () => {
    const obj = {};
    setTimeout(() => {
      obj.onload();
    }, 1);
    return obj;
  },
  head: {
    appendChild: () => {}
  },
  getElementsByTagName: () => {
    return [
      {
        appendChild: () => {}
      }
    ];
  }
};

describe("loader", () => {
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
});
