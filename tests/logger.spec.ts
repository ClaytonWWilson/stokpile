import { expect, test } from "@playwright/test";
import { Logger } from "../src/Logger";
import Console from "../src/outputs/Console";
import Tampermonkey from "../src/outputs/Tampermonkey";
import Callback from "../src/outputs/Callback";
import { LogContext, LogLevel, LogMeta } from "../src/types/logger";

test("Constructor", () => {
  const _logger = new Logger();
});

// test("Add outputs", () => {
//   const logger = new Logger();

//   const consoleOutput = new Console();
//   const tampermonkeyOutput = new Tampermonkey();
//   const callbackOutput = new Callback({
//     enabled: true,
//     callback: (message, meta, context) => {
//       console.log(message, meta, context);
//       return;
//     },
//   });
//   logger
//     .addOutput(consoleOutput)
//     .addOutput(tampermonkeyOutput)
//     .addOutput(callbackOutput);
// });

// test("Add storage", () => {
//   const logger = new Logger();

//   const tampermonkeyOutput = new Tampermonkey();
//   logger.setStorage(tampermonkeyOutput);
// });

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

test("Log with multiple outputs", () => {
  const logMessage = "Very important message";

  function callbackfn(message: string, meta: LogMeta, _context: LogContext) {
    expect(message).toBe(logMessage);
    expect(meta.level).toBe(LogLevel.WARN);
  }
  const callbackOutput1 = new Callback({
    enabled: true,
    callback: callbackfn,
  });

  const callbackOutput2 = new Callback({
    enabled: true,
    callback: callbackfn,
  });

  const callbackOutput3 = new Callback({
    enabled: true,
    callback: callbackfn,
  });

  const logger = new Logger()
    .addOutput(callbackOutput1)
    .addOutput(callbackOutput2)
    .addOutput(callbackOutput3);

  logger.warn(logMessage);
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

// test("Overflow logs buffer", () => {
//   const logger = new Logger({
//     bufferCapacity: 100,
//     outputs: { console: { enabled: false } },
//   });

//   for (let i = 0; i < 100; i++) {
//     logger.log(`Iteration: ${i}`);
//   }

//   logger.log("done");
// });

// test("Export logs without tampermonkey", async () => {
//   const logger = new Logger({ outputs: { console: { enabled: false } } });
//   for (let i = 0; i < 10; i++) {
//     logger.log(`Iteration: ${i}`);
//   }

//   const export_one = await logger.export(1);

//   expect(export_one.length).toBe(1);
//   expect(export_one[0]).toContain("Iteration: 9");

//   const export_five = await logger.export(5);

//   expect(export_five.length).toBe(5);
//   expect(export_five[3]).toContain("Iteration: 8");

//   const export_all = await logger.export(100);

//   expect(export_all.length).toBe(10);
//   expect(export_all[9]).toContain("Iteration: 9");
// });

// const _logger1 = new Logger({});

//   const _logger2 = new Logger({
//     outputs: {
//       tampermonkey: {
//         enabled: false,
//         maxBuckets: 0,
//         bucketIndexKey: "",
//       },
//     },
//   });
//   const _logger3 = new Logger({
//     outputs: {
//       console: {
//         enabled: false,
//       },
//     },
//   });
//   const _logger4 = new Logger({ outputs: { console: { enabled: true } } });
//   const _logger5 = new Logger({
//     outputs: { console: { enabled: false }, tampermonkey: { enabled: false } },
//   });
//   const _logger6 = new Logger({ outputs: { callback: () => {} } });
//   const _logger7 = new Logger({
//     outputs: {
//       console: { enabled: true },
//       tampermonkey: { enabled: false },
//       callback: () => {},
//     },
//   });
//   const _logger8 = new Logger({
//     outputs: {
//       console: {
//         style: {
//           trace: { backgroundColor: "#ababab", textColor: "#bababa" },
//           debug: { backgroundColor: "#436ba3", textColor: "#197921" },
//           info: { backgroundColor: "#9991aa", textColor: "#906851" },
//           warn: { backgroundColor: "#deadbe", textColor: "#ad7ce3" },
//         },
//       },
//     },
//   });
// });
