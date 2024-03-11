import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const production = !process.env.ROLLUP_WATCH;

const productionBuildMinified = {
  input: "src/Logger.ts",
  output: {
    sourcemap: false,
    format: "es",
    name: "lognautica",
    file: "dist/lognautica.min.js",
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

const productionBuild = {
  input: "src/Logger.ts",
  output: {
    sourcemap: false,
    format: "es",
    name: "lognautica",
    file: "dist/lognautica.js",
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    typescript({
      sourceMap: false,
      inlineSourceMap: false,
      inlineSources: false,
      removeComments: true,
    }),
  ],
  watch: {
    clearScreen: false,
  },
};

const devBuild = {
  input: "src/Logger.ts",
  output: {
    sourcemap: true,
    format: "es",
    name: "lognautica",
    file: "dist/lognautica.dev.js",
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

const build = [];
if (production) {
  build.push(productionBuild);
  build.push(productionBuildMinified);
} else {
  build.push(devBuild);
}

export default build;
