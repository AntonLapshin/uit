import should from "should";
import { rules } from "./rules";
import { Component } from "./component";
import { Observable } from "./observable";
import { helper } from "./test.helper";

describe("Rules", () => {
  it("src", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {
      ctx.src = new Observable();
    });
    rules.src.call(component, el, "src");
    should.not.exist(el.getAttribute("src"));
    component.src("resource/test.png");
    el.getAttribute("src").should.be.equal("resource/test.png");
  });
  it("src via data", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {});
    rules.src.call(component, el, "data.src");
    should.not.exist(el.getAttribute("src"));
    component.set({ src: "resource/test.png" });
    el.getAttribute("src").should.be.equal("resource/test.png");
    component.set({ src: "2" });
    el.getAttribute("src").should.be.equal("2");
  });
  it("href", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {});
    rules.href.call(component, el, "data.href");
    should.not.exist(el.getAttribute("href"));
    component.set({ href: "resource/test.png" });
    el.getAttribute("href").should.be.equal("resource/test.png");
    component.set({ href: "1" });
    el.getAttribute("href").should.be.equal("1");
  });
  it("click", done => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {
      ctx.clickHandler = function(el) {
        should.exist(el);
        done();
      };
    });
    rules.click.call(component, el, "clickHandler");
  });
  it("text", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {
      ctx.text = new Observable();
    });
    rules.text.call(component, el, "text");
    should.not.exist(el.textContent);
    component.text("Some text");
    el.textContent.should.be.equal("Some text");
  });
  it("text via binding", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {});
    rules.text.call(component, el, "data.text");
    should.not.exist(el.textContent);
    component.set({ text: new Observable("Some text") });
    el.textContent.should.be.equal("Some text");
    component.set({ text: new Observable("Some text 2") });
  });
  it("class", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {});
    rules.class.call(
      component,
      el,
      "data.completed",
      "class: data.completed: completed"
    );
    should.not.exist(el.classList.completed);
    component.set({ completed: true });
    el.classList.completed.should.be.equal(true);
  });
  it("attr", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {});
    rules.attr.call(component, el, "data.id", "attr: data.id: id");
    should.not.exist(el.id);
    component.set({ id: "element_1" });
    el.id.should.be.equal("element_1");
  });
  it("html", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {
      ctx.html = new Observable();
    });
    rules.html.call(component, el, "html");
    should.not.exist(el.innerHTML);
    component.html("<div></div>");
    el.innerHTML.should.be.equal("<div></div>");
  });
  it("val", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {
      ctx.val = new Observable();
    });
    rules.val.call(component, el, "val");
    should.not.exist(el.value);
    component.val(5);
    el.value.should.be.equal(5);
  });
  it("prop", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {});
    should.not.exist(component.prop);
    rules.prop.call(component, el, "prop");
    component.prop.should.be.equal(el);
  });
  it("visible", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {
      ctx.visible = new Observable(false);
    });
    rules.visible.call(component, el, "visible");
    component.el.style.display = "none";
    component.visible(true);
    component.el.style.display = "";
  });
  it("invisible", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {
      ctx.invisible = new Observable(true);
    });
    rules.invisible.call(component, el, "invisible");
    component.el.style.display = "none";
    component.invisible(false);
    component.el.style.display = "";
  });
  it("enable", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {
      ctx.enable = new Observable(false);
    });
    rules.enable.call(component, el, "enable");
    component.el.classList.disabled.should.be.equal(true);
    component.enable(true);
    component.el.classList.disabled.should.be.equal(false);
  });
  it("disable", () => {
    const el = new Element("test", []);
    const component = new Component("test", null, el, ctx => {
      ctx.disable = new Observable(true);
    });
    rules.disable.call(component, el, "disable");
    component.el.classList.disabled.should.be.equal(true);
    component.disable(false);
    component.el.classList.disabled.should.be.equal(false);
  });
});
