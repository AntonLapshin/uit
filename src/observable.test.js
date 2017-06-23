import should from "should";
import { Observable } from "./observable";

describe("Observable", () => {
  it("on", done => {
    const item = Observable(10);
    item().should.be.equal(10);

    let count = 0;
    item.on((data, olddata) => {
      data.should.be.equal(11);
      olddata.should.be.equal(10);
      count++;
    });
    item(11);
    count.should.be.equal(1);
    item().should.be.equal(11);
    done();
  });

  it("off", done => {
    const item = Observable(10);
    item().should.be.equal(10);

    let count = 0;
    const token = item.on(() => {
      count++;
    });
    item(11);
    item.off(token);
    item(12);
    count.should.be.equal(1);
    item().should.be.equal(12);
    done();
  });
});
