import { LogLabel, LogLevel, LogOutputs } from "./types/logger";
import { gzip, randomString, stringifyInstance, ungzip } from "./lib/utilities";
import { DEFAULT_STYLES } from "./lib/defaults";

import { LogContext, BucketInfo, LogMeta, LogConfig } from "./types/logger";

const MESSAGE_STYLE = "background: inherit; color: inherit;";

function getLabel(level: number) {
  if (level <= LogLevel.TRACE) {
    return LogLabel.TRACE;
  } else if (level <= LogLevel.DEBUG) {
    return LogLabel.DEBUG;
  } else if (level <= LogLevel.INFO) {
    return LogLabel.INFO;
  } else if (level <= LogLevel.WARN) {
    return LogLabel.WARN;
  } else {
    return LogLabel.FATAL;
  }
}

export class Logger {
  private buffer: string[];
  private bufferLength: number;
  private bucketIndex: BucketInfo[];
  private outputs: LogOutputs;
  private bufferCapacity: number;

  constructor(config: Partial<LogConfig> = {}) {
    this.buffer = [];
    this.bufferLength = 0;
    const parsedConfig = LogConfig.parse(config);
    this.bufferCapacity = parsedConfig.bufferCapacity;
    this.outputs = parsedConfig.outputs;

    if (this.outputs.tampermonkey.enabled) {
      this.bucketIndex = JSON.parse(
        GM_getValue(this.outputs.tampermonkey.bucketIndexKey, "[]")
      );
    } else {
      this.bucketIndex = [];
    }
  }

  log(message: string, context: LogContext = {}) {
    const level = context.level ? context.level : LogLevel.FATAL;
    const label = getLabel(level);

    const meta: LogMeta = {
      context,
      time: new Date().valueOf(),
    };

    if (this.outputs.console.enabled) {
      this.consolePrint(label, message, meta);
    }

    const textOutput = `${new Date(
      meta.time
    ).toISOString()} [${label}] ${message} - ${stringifyInstance(
      meta.context
    )}`;

    this.buffer.push(textOutput);
    this.bufferLength += textOutput.length;

    if (this.outputs.callback) {
      this.outputs.callback(textOutput);
    }

    if (this.bufferLength >= this.bufferCapacity) {
      if (this.outputs.tampermonkey.enabled) {
        this.flush();
      } else {
        while (this.bufferLength >= this.bufferCapacity) {
          const stale = this.buffer.shift();
          const offset = stale ? stale.length : 0;
          this.bufferLength -= offset;
        }
      }
    }
  }

  trace(message: string, context?: Object) {
    this.log(message, {
      level: LogLevel.TRACE,
      stacktrace: new Error().stack?.slice(13), // Remove the "Error\n    at "
      ...context,
    });
  }

  debug(message: string, context?: Object) {
    this.log(message, { level: LogLevel.DEBUG, ...context });
  }

  info(message: string, context?: Object) {
    this.log(message, { level: LogLevel.INFO, ...context });
  }

  warn(message: string, context?: Object) {
    this.log(message, { level: LogLevel.WARN, ...context });
  }

  fatal(message: string, context?: Object) {
    this.log(message, { level: LogLevel.FATAL, ...context });
  }

  private consolePrint(label: LogLabel, message: string, meta: LogMeta) {
    const style = `background: ${DEFAULT_STYLES[label].background}; color: ${DEFAULT_STYLES[label].color}; font-weight: bold; border-radius: 4px;`;

    switch (label) {
      case LogLabel.TRACE:
        console.trace(
          `%c ${label} ` + `%c ${message}`,
          style,
          MESSAGE_STYLE,
          meta
        );
        break;
      case LogLabel.DEBUG:
        console.debug(
          `%c ${label} ` + `%c ${message}`,
          style,
          MESSAGE_STYLE,
          meta
        );
        break;
      case LogLabel.INFO:
        console.info(
          `%c ${label} ` + `%c ${message}`,
          style,
          MESSAGE_STYLE,
          meta
        );
        break;
      case LogLabel.WARN:
        console.warn(
          `%c ${label} ` + `%c ${message}`,
          style,
          MESSAGE_STYLE,
          meta
        );
        break;
      case LogLabel.FATAL:
        console.error(
          `%c ${label} ` + `%c ${message}`,
          style,
          MESSAGE_STYLE,
          meta
        );
        break;
      default:
        console.log(
          `%c ${label} ` + `%c ${message}`,
          style,
          MESSAGE_STYLE,
          meta
        );
        break;
    }
  }

  async flush() {
    // Clear buffer
    const stringifiedBuffer = JSON.stringify(this.buffer);
    this.buffer = [];
    this.bufferLength = 0;

    // Don't flush unless tampermonkey output is enabled
    if (!this.outputs.tampermonkey.enabled) {
      return;
    }

    // Generate non-clashing name
    let newBucketName = randomString(10).toLowerCase();
    while (GM_getValue(newBucketName, undefined) !== undefined) {
      newBucketName = randomString(10);
    }

    // GZip data
    const gzipped = await gzip(stringifiedBuffer);

    // Update bucketIndex with info
    const newBucket: BucketInfo = {
      name: newBucketName,
      size: gzipped.length,
      createdAt: new Date().valueOf(),
    };

    // Write bucketIndex to disk
    this.bucketIndex.push(newBucket);
    GM_setValue(
      this.outputs.tampermonkey.bucketIndexKey,
      JSON.stringify(this.bucketIndex)
    );

    // Write gzipped data to new bucket
    GM_setValue(newBucketName, gzipped);

    if (this.bucketIndex.length <= this.outputs.tampermonkey.maxBuckets) {
      return;
    }

    // Delete old buckets if the number is too large
    let oldBuckets = this.bucketIndex
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, -this.bufferCapacity);

    oldBuckets.forEach((oldBucket) => {
      GM_deleteValue(oldBucket.name);
      let deleteIndex = this.bucketIndex.findIndex(
        (indexBucket) => indexBucket.name === oldBucket.name
      );

      if (deleteIndex === -1) {
        console.error("Invalid index for bucket");
        return;
      }

      this.bucketIndex.splice(deleteIndex, 1);
    });

    // Update tampermonkey bucket index
    GM_setValue(
      this.outputs.tampermonkey.bucketIndexKey,
      JSON.stringify(this.bucketIndex)
    );
  }

  async export(amount: number) {
    // Check if the buffer has the requested amount
    if (this.buffer.length >= amount) {
      return this.buffer.slice(this.buffer.length - amount);
    }

    // Only return buffer if tamppermonkey is disabled
    if (!this.outputs.tampermonkey.enabled) {
      return [...this.buffer];
    }

    let logs = [...this.buffer];

    for (const bucket of this.bucketIndex) {
      // Get data from bucket
      const gzipped = GM_getValue(bucket.name, undefined);
      if (gzipped === undefined) {
        console.error("Bucket does not exist on disk", bucket);
        continue;
      }
      // Ungzip and parse
      const ungzipped = await ungzip(gzipped);
      let lines: string[] = [];
      try {
        lines = JSON.parse(ungzipped) as string[];
      } catch (err) {
        // Bucket has invalid or empty data
        lines = [];
      }
      // prepend to logs up to amount
      if (logs.length + lines.length < amount) {
        // Need to grab more from storage
        logs.unshift(...lines);
      } else if (logs.length + lines.length == amount) {
        // Have the exact amount
        logs.unshift(...lines);
        break;
      } else {
        // Grab a slice of the exact amount needed
        logs.unshift(...lines.slice(0, amount - logs.length));
        break;
      }
    }

    return logs;
  }

  async exportGzipped(amount: number) {
    const lines = await this.export(amount);
    const gzipped = await gzip(JSON.stringify(lines));
    return gzipped;
  }
}
