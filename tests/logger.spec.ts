import { expect, test } from "@playwright/test";
import { Logger } from "../src/Logger";
import Console from "../src/outputs/Console";
import Tampermonkey from "../src/outputs/Tampermonkey";
import Callback from "../src/outputs/Callback";
import { LogContext, LogLevel, LogMeta } from "../src/types/logger";

test("Constructor", () => {
  const _logger = new Logger();
});

test("Add outputs", () => {
  const logger = new Logger();

  const consoleOutput = new Console();
  const tampermonkeyOutput = new Tampermonkey();
  const callbackOutput = new Callback({
    enabled: true,
    callback: (message, meta, context) => {
      console.log(message, meta, context);
      return;
    },
  });
  logger
    .addOutput(consoleOutput)
    .addOutput(tampermonkeyOutput)
    .addOutput(callbackOutput);
});

test("Add storage", () => {
  const logger = new Logger();

  const tampermonkeyOutput = new Tampermonkey();
  logger.setStorage(tampermonkeyOutput);
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

test("Log messages with context", () => {
  let logMessage: string = "";
  let logMeta: LogMeta = { level: LogLevel.WARN, time: new Date() };
  let logContext: LogContext = {};
  const logger = new Logger();
  const callbackOutput = new Callback({
    enabled: true,
    callback(message, meta, context) {
      logMessage = message;
      logMeta = meta;
      logContext = context;
    },
  });

  logger.addOutput(callbackOutput);

  logger.debug("test context 1", { data: "hello world" });
  expect(logMessage).toBe("test context 1");
  expect(logMeta.level).toBe(LogLevel.DEBUG);
  expect(logContext.data).toBe("hello world");

  const req = new Request("https://www.github.com");

  logger.info("test context 2", {
    request: req,
  });

  expect(logMessage).toBe("test context 2");
  expect(logMeta.level).toBe(LogLevel.INFO);
  expect(logContext.request).toBeTruthy();
});

test("Logs contain timestamps", () => {
  const logger = new Logger();
  const callbackOutput = new Callback({
    enabled: true,
    callback(_message, meta, _context) {
      const logTime = meta.time;
      expect(logTime.toISOString()).toMatch(
        /^[0-9]+-[0-9]+-[0-9]+T[0-9]+:[0-9]+:[0-9]+.[0-9]+Z/gm
      );
      expect(new Date().valueOf() - logTime.valueOf()).toBeLessThan(1000);
    },
  });

  logger.addOutput(callbackOutput);
  logger.debug("test");
});
