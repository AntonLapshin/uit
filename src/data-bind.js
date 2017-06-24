import { opts } from "./block";
import { matches } from "./lookup";
import { rules } from "./rules";

/**
 * Data-binding feature implementation
 */
export function dataBind() {
  if (!els || els.length === 0) {
    return;
  }
  const els = Array.prototype.filter.call(this.elAll, el => {
    return matches(el, `[${opts.DATA_BIND_ATTRIBUTE}]`);
  });
  els.forEach(el => {
    const statements = el.getAttribute(opts.DATA_BIND_ATTRIBUTE).split(",");
    statements.forEach(statement => {
      const parts = statement.split(":");
      const key = parts[0].trim();
      const value = parts[1].trim();
      if (rules[key]) {
        rules[key].call(this, el, value, statement);
      }
    });
  });
}
