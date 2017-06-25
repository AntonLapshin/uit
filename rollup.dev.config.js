import resolve from "rollup-plugin-node-resolve";

export default {
  entry: "src/main.js",
  format: "umd",
  moduleName: "uit",
  plugins: [resolve()],
  dest: "bin/uit.js"
};
