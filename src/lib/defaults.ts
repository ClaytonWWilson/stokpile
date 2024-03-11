import type { DeepRequired } from "../types/generic";
import type { ConsoleStyles } from "../types/logger";

export const DEFAULT_STYLES: DeepRequired<ConsoleStyles> = {
  trace: {
    background: "#949494",
    color: "#fff",
  },
  debug: {
    background: "#fe7bf3",
    color: "#fff",
  },
  info: {
    background: "#65f10e",
    color: "#fff",
  },
  warn: {
    background: "#faf200",
    color: "#000",
  },
  fatal: {
    background: "#cc0018",
    color: "#fff",
  },
};
