import { test } from "@playwright/test";
import { Logger } from "../../src/Logger";
import Console from "../../src/outputs/Console";

test("Constructors and logging messages", () => {
  const logger = new Logger();
  const empty = new Console();
  const emptyObject = new Console({});
  const enabled = new Console({ enabled: true });
  const disabled = new Console({ enabled: false });
  const partialStyles = new Console({
    style: {
      info: {
        backgroundColor: "#a43129",
      },
      trace: {
        textColor: "#ccecce",
      },
      warn: {},
    },
  });

  const full = new Console({
    enabled: true,
    style: {
      debug: {
        backgroundColor: "#000",
        textColor: "#fff",
      },
      fatal: {
        backgroundColor: "#000",
        textColor: "#fff",
      },
      info: {
        backgroundColor: "#000",
        textColor: "#fff",
      },
      trace: {
        backgroundColor: "#000",
        textColor: "#fff",
      },
      warn: {
        backgroundColor: "#000",
        textColor: "#fff",
      },
    },
  });
  logger
    .addOutput(empty)
    .addOutput(emptyObject)
    .addOutput(enabled)
    .addOutput(disabled)
    .addOutput(partialStyles)
    .addOutput(full);

  logger.debug("hello", { a: "yes" });
  logger.warn("there", { b: false });
  logger.trace("world", { absolutely: "not" });
});
