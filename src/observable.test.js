const should = require("should");
const { Observable } = require("./observable");

describe("Observable", function() {
  it("on", function(done) {
    const item = Observable(10);
    item().should.be.equal(10);

    let count = 0;
    item.on((data, olddata) => {
      data.should.be.equal(11);
      olddata.should.be.equal(10);
      count++;
    });
    item(11);
    setTimeout(() => {
      count.should.be.equal(1);
      item().should.be.equal(11);
      done();
    }, 1);
  });

  it("off", function(done) {
    const item = Observable(10);
    item().should.be.equal(10);

    let count = 0;
    const token = item.on(() => {
      count++;
    });
    item.off(token);
    item(11);
    setTimeout(() => {
      count.should.be.equal(0);
      item().should.be.equal(11);
      done();
    }, 1);
  });
});
