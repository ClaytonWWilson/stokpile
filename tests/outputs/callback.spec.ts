import { expect, test } from "@playwright/test";
import { Logger } from "../../src/Logger";
import Callback from "../../src/outputs/Callback";
import { LogContext, LogLevel, LogMeta } from "../../src/types/logger";

test("Constructor", () => {
  const _callbackOutput = new Callback({
    enabled: true,
    callback(_message, _meta, _context) {
      return;
    },
  });
});

test("Log Messages", () => {
  let logMessages: string[] = [];
  let logMetas: LogMeta[] = [];
  let logContexts: LogContext[] = [];

  const callbackOutput = new Callback({
    enabled: true,
    callback(message, meta, context) {
      logMessages.push(message);
      logMetas.push(meta);
      logContexts.push(context);
    },
  });

  const logger = new Logger().addOutput(callbackOutput);

  logger.log("logging a", 10, {});

  logger.trace("logging b");
  logger.debug("logging c");
  logger.info("logging d");
  logger.warn("logging e");
  logger.fatal("logging f");

  expect(logMetas[0].level).toBe(LogLevel.TRACE);
  expect(logMessages[0]).toBe("logging a");

  expect(logMetas[1].level).toBe(LogLevel.TRACE);
  expect(logMessages[1]).toBe("logging b");

  expect(logMetas[2].level).toBe(LogLevel.DEBUG);
  expect(logMessages[2]).toBe("logging c");

  expect(logMetas[3].level).toBe(LogLevel.INFO);
  expect(logMessages[3]).toBe("logging d");

  expect(logMetas[4].level).toBe(LogLevel.WARN);
  expect(logMessages[4]).toBe("logging e");

  expect(logMetas[5].level).toBe(LogLevel.FATAL);
  expect(logMessages[5]).toBe("logging f");
});
