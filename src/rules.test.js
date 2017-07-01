import should from "should";
import { rules } from "./rules";
import { Component } from "./component";
import { proxy } from "proxy-observable";
import { helper } from "./test.helper";

describe("Rules", () => {
  // it("src", () => {
  //   const el = new Element("test", []);
  //   const instance = new Component("test", null, el, () => {});
  //   rules.src.call(instance, el, "data.src");
  //   should.not.exist(el.getAttribute("src"));
  //   instance.set(proxy({ src: "resource/test.png" }));
  //   el.getAttribute("src").should.be.equal("resource/test.png");
  // });
  it("src", () => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, () => {});
    rules.src.call(instance, el, "data.src");
    should.not.exist(el.getAttribute("src"));
    instance.set(proxy({ src: "resource/test.png" }));
    el.getAttribute("src").should.be.equal("resource/test.png");
    instance.set(proxy({ src: "2" }));
    el.getAttribute("src").should.be.equal("2");
    instance.data.src = "3";
    el.getAttribute("src").should.be.equal("3");
  });
  it("href", () => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, () => {});
    rules.href.call(instance, el, "data.href");
    should.not.exist(el.getAttribute("href"));
    instance.set({ href: "resource/test.png" });
    el.getAttribute("href").should.be.equal("resource/test.png");
  });
  it("click", done => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, ctx => {
      ctx.clickHandler = function(el) {
        should.exist(el);
        done();
      };
    });
    rules.click.call(instance, el, "clickHandler");
  });
  it("text", () => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, () => {});
    rules.text.call(instance, el, "data.text");
    should.not.exist(el.textContent);
    instance.set({ text: "Some text" });
    el.textContent.should.be.equal("Some text");
  });
  it("class", () => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, () => {});
    rules.class.call(
      instance,
      el,
      "data.completed",
      "class: data.completed: completed"
    );
    should.not.exist(el.classList.completed);
    instance.set({ completed: true });
    el.classList.completed.should.be.equal(true);
  });
  it("attr", () => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, ctx => {});
    rules.attr.call(instance, el, "data.id", "attr: data.id: id");
    should.not.exist(el.id);
    instance.set({ id: "element_1" });
    el.id.should.be.equal("element_1");
  });
  it("html", () => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, () => {});
    rules.html.call(instance, el, "data.html");
    should.not.exist(el.innerHTML);
    instance.set({ html: "<div></div>" });
    el.innerHTML.should.be.equal("<div></div>");
  });
  it("val", () => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, () => {});
    rules.val.call(instance, el, "data.val");
    should.not.exist(el.value);
    instance.set({ val: 5 });
    el.value.should.be.equal(5);
  });
  it("ref", () => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, () => {});
    should.not.exist(instance.ref);
    rules.ref.call(instance, el, "ref");
    instance.ref.should.be.equal(el);
  });
  it("visible", () => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, () => {});
    rules.visible.call(instance, el, "data.visible");
    instance.el.style.display = "none";
    instance.set({ visible: true });
    instance.el.style.display = "";
  });
  it("invisible", () => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, () => {});
    rules.invisible.call(instance, el, "data.invisible");
    instance.el.style.display = "none";
    instance.set({ invisible: false });
    instance.el.style.display = "";
  });
  it("enable", () => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, () => {});
    rules.enable.call(instance, el, "data.enable");
    instance.set({ enable: true });
    instance.el.classList.disabled.should.be.equal(false);
  });
  it("disable", () => {
    const el = new Element("test", []);
    const instance = new Component("test", null, el, () => {});
    rules.disable.call(instance, el, "data.disable");
    instance.set({ disable: false });
    instance.el.classList.disabled.should.be.equal(false);
  });
});
