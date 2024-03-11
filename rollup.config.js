import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";

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
    typescript({
      sourceMap: false,
      inlineSources: false,
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
    typescript({
      sourceMap: false,
      inlineSources: false,
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
