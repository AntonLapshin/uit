import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";

export default {
  entry: "src/main.js",
  format: "cjs",
  plugins: [
    resolve(),
    babel({
      babelrc: false,
      presets: [
        [
          "latest",
          {
            es2015: {
              modules: false
            }
          }
        ]
      ],
      plugins: ["external-helpers"],
      exclude: "node_modules/**" // only transpile our source code
    }),
    uglify()
  ],
  dest: "dist/uit.min.js"
};
