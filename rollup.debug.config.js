import resolve from "rollup-plugin-node-resolve";

export default {
  entry: "src/debug.js",
  format: "umd",
  moduleName: "uitDebug",
  plugins: [resolve()],
  dest: "bin/uit.debug.js"
};
