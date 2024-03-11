import { expect, test } from "@playwright/test";
import { Logger } from "../src/Logger";

// Can't use tampermonkey since the tampermonkey functions are not defined in the testing suite
test("Constructors", () => {
  const _logger0 = new Logger();
  const _logger1 = new Logger({});

  const _logger2 = new Logger({
    outputs: {
      tampermonkey: {
        enabled: false,
        maxBuckets: 0,
        bucketIndexKey: "",
      },
    },
  });
  const _logger3 = new Logger({
    outputs: {
      console: {
        enabled: false,
      },
    },
  });
  const _logger4 = new Logger({ outputs: { console: { enabled: true } } });
  const _logger5 = new Logger({
    outputs: { console: { enabled: false }, tampermonkey: { enabled: false } },
  });
  const _logger6 = new Logger({ outputs: { callback: () => {} } });
  const _logger7 = new Logger({
    outputs: {
      console: { enabled: true },
      tampermonkey: { enabled: false },
      callback: () => {},
    },
  });
  const _logger8 = new Logger({
    outputs: {
      console: {
        style: {
          trace: { backgroundColor: "#ababab", textColor: "#bababa" },
          debug: { backgroundColor: "#436ba3", textColor: "#197921" },
          info: { backgroundColor: "#9991aa", textColor: "#906851" },
          warn: { backgroundColor: "#deadbe", textColor: "#ad7ce3" },
        },
      },
    },
  });
});

test("Log Messages", () => {
  let logs = "";
  const logger = new Logger({
    outputs: {
      tampermonkey: { enabled: false },
      console: { enabled: false },
      callback: (message) => {
        logs += message + "\n";
      },
    },
  });
  logger.log("logging a");

  logger.trace("logging b");
  logger.debug("logging c");
  logger.info("logging d");
  logger.warn("logging e");
  logger.fatal("logging f");

  const lines = logs.split("\n");
  expect(lines[0]).toContain("fatal");
  expect(lines[0]).toContain("logging a");

  expect(lines[1]).toContain("trace");
  expect(lines[1]).toContain("logging b");

  expect(lines[2]).toContain("debug");
  expect(lines[2]).toContain("logging c");

  expect(lines[3]).toContain("info");
  expect(lines[3]).toContain("logging d");

  expect(lines[4]).toContain("warn");
  expect(lines[4]).toContain("logging e");

  expect(lines[5]).toContain("fatal");
  expect(lines[5]).toContain("logging f");

  expect(lines.length).toBe(7);
});

test("Log messages with context", () => {
  let logs = "";
  const logger = new Logger({
    outputs: {
      console: { enabled: false },
      callback: (message) => {
        logs += message + "\n";
      },
    },
  });

  logger.debug("test context", { data: "hello world" });
  const req = new Request("https://www.github.com");

  logger.info("test context", {
    request: req,
  });

  const lines = logs.split("\n");
  expect(lines[0]).toContain('{"level":20,"data":"hello world"}');
  expect(lines[1]).toContain("https://www.github.com");
});

test("Logs contain timestamps", () => {
  let logs = "";
  const logger = new Logger({
    outputs: {
      console: { enabled: false },
      callback: (message) => {
        logs += message + "\n";
      },
    },
  });

  logger.log("test");

  expect(logs).toMatch(/^[0-9]+-[0-9]+-[0-9]+T[0-9]+:[0-9]+:[0-9]+.[0-9]+Z/gm);
});

test("Overflow logs buffer", () => {
  const logger = new Logger({
    bufferCapacity: 100,
    outputs: { console: { enabled: false } },
  });

  for (let i = 0; i < 100; i++) {
    logger.log(`Iteration: ${i}`);
  }

  logger.log("done");
});

test("Export logs without tampermonkey", async () => {
  const logger = new Logger({ outputs: { console: { enabled: false } } });
  for (let i = 0; i < 10; i++) {
    logger.log(`Iteration: ${i}`);
  }

  const export_one = await logger.export(1);

  expect(export_one.length).toBe(1);
  expect(export_one[0]).toContain("Iteration: 9");

  const export_five = await logger.export(5);

  expect(export_five.length).toBe(5);
  expect(export_five[3]).toContain("Iteration: 8");

  const export_all = await logger.export(100);

  expect(export_all.length).toBe(10);
  expect(export_all[9]).toContain("Iteration: 9");
});
