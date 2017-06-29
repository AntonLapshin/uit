import { opts } from "./block";
import { rules } from "./rules";

/**
 * Data-binding feature implementation
 */
export function dataBind() {
  if (!this.elAll || this.elAll.length === 0) {
    return;
  }
  const els = Array.prototype.filter.call(this.elAll, el => {
    return el.matches(`[${opts.DATA_BIND_ATTRIBUTE}]`);
  });
  els.forEach(el => {
    const bindAttr = el.getAttribute(opts.DATA_BIND_ATTRIBUTE);
    if (!bindAttr) return;
    const statements = bindAttr.split(",");
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
