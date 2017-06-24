import should from "should";
import { rules } from "./rules";
import { Block } from "./block";
import { Observable } from "./observable";
import { helper } from "./test.helper";

describe("Rules", () => {
  it("src", () => {
    const el = new Element("test", []);
    const block = new Block("test", null, el, ctx => {
      ctx.src = new Observable();
    });
    rules.src.call(block, el, "src");
    should.not.exist(el.getAttribute("src"));
    block.src("resource/test.png");
    el.getAttribute("src").should.be.equal("resource/test.png");
  });
  it("text", () => {
    const el = new Element("test", []);
    const block = new Block("test", null, el, ctx => {
      ctx.text = new Observable();
    });
    rules.text.call(block, el, "text");
    should.not.exist(el.textContent);
    block.text("Some text");
    el.textContent.should.be.equal("Some text");
  });
  it("html", () => {
    const el = new Element("test", []);
    const block = new Block("test", null, el, ctx => {
      ctx.html = new Observable();
    });
    rules.html.call(block, el, "html");
    should.not.exist(el.innerHTML);
    block.html("<div></div>");
    el.innerHTML.should.be.equal("<div></div>");
  });
  it("val", () => {
    const el = new Element("test", []);
    const block = new Block("test", null, el, ctx => {
      ctx.val = new Observable();
    });
    rules.val.call(block, el, "val");
    should.not.exist(el.value);
    block.val(5);
    el.value.should.be.equal(5);
  });
  it("prop", () => {
    const el = new Element("test", []);
    const block = new Block("test", null, el, ctx => {});
    should.not.exist(block.prop);
    rules.prop.call(block, el, "prop");
    block.prop.should.be.equal(el);
  });
  it("visible", () => {
    const el = new Element("test", []);
    const block = new Block("test", null, el, ctx => {
      ctx.visible = new Observable(false);
    });
    rules.visible.call(block, el, "visible");
    block.el.style.display = "none";
    block.visible(true);
    block.el.style.display = "";
  });
  it("invisible", () => {
    const el = new Element("test", []);
    const block = new Block("test", null, el, ctx => {
      ctx.invisible = new Observable(true);
    });
    rules.invisible.call(block, el, "invisible");
    block.el.style.display = "none";
    block.invisible(false);
    block.el.style.display = "";
  });
  it("enable", () => {
    const el = new Element("test", []);
    const block = new Block("test", null, el, ctx => {
      ctx.enable = new Observable(false);
    });
    rules.enable.call(block, el, "enable");
    block.el.classList.disabled.should.be.equal(true);
    block.enable(true);
    block.el.classList.disabled.should.be.equal(false);
  });
  it("disable", () => {
    const el = new Element("test", []);
    const block = new Block("test", null, el, ctx => {
      ctx.disable = new Observable(true);
    });
    rules.disable.call(block, el, "disable");
    block.el.classList.disabled.should.be.equal(true);
    block.disable(false);
    block.el.classList.disabled.should.be.equal(false);
  });
});
