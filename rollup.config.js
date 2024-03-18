import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const production = !process.env.ROLLUP_WATCH;

function productionBuild() {
  return {
    input: "src/index.ts",
    output: {
      sourcemap: false,
      format: "esm",
      name: "stokpile",
      dir: "dist",
    },
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      typescript({
        sourceMap: false,
        inlineSourceMap: false,
        inlineSources: false,
        removeComments: true,
      }),
      terser(),
    ],
    watch: {
      clearScreen: false,
    },
  };
}

function devBuild() {
  return {
    input: "src/index.ts",
    output: {
      sourcemap: true,
      format: "esm",
      name: "stokpile",
      dir: "dist",
    },
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      typescript({
        sourceMap: true,
        inlineSources: true,
      }),
    ],
    watch: {
      clearScreen: false,
    },
  };
}

const build = [];
if (production) {
  build.push(productionBuild());
} else {
  build.push(devBuild());
}

export default build;
