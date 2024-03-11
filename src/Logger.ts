export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  FATAL = 50,
}

enum LogLabel {
  TRACE = "trace",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  FATAL = "fatal",
}

export interface TampermonkeyOutputOpts {
  enabled: boolean;
  maxBuckets?: number;
  bucketIndexKey?: string;
}

export interface ConsoleOutputOpts {
  enabled: boolean;
}

export interface LogOutputs {
  console?: ConsoleOutputOpts;
  tampermonkey?: TampermonkeyOutputOpts;
  callback: ((message: string) => any) | undefined;
}

export interface LogConfig {
  outputs?: LogOutputs;
  bufferCapacity?: number;
}

export interface LogContext {
  level?: number;
  [key: string]: any;
}

interface LogMeta {
  context: LogContext;
  time: number;
}

interface BucketInfo {
  name: string;
  size: number;
  createdAt: number;
}

const DEFAULT_OUTPUTS: Required<LogOutputs> = {
  console: { enabled: true },
  tampermonkey: {
    enabled: false,
    maxBuckets: 10,
    bucketIndexKey: "bucket_index",
  },
  callback: undefined,
};
const DEFAULT_CONFIG: Required<LogConfig> = {
  outputs: DEFAULT_OUTPUTS,
  bufferCapacity: 100_000,
};
const MESSAGE_STYLE = "background: inherit; color: inherit;";

const STYLES = {
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

export function blobToBase64(blob: Blob) {
  return new Promise<string | ArrayBuffer>((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(btoa(reader.result as string));
    reader.readAsBinaryString(blob);
  });
}

export async function gzip(data: string) {
  const cs = new CompressionStream("gzip");
  const blob = new Blob([data]);
  const compressedStream = blob.stream().pipeThrough(cs);
  const gzipData = await new Response(compressedStream).blob();
  return (await blobToBase64(gzipData)) as string;
}

export async function ungzip(base64: string) {
  const b64decoded = atob(base64);

  const arrayBuffer = new ArrayBuffer(b64decoded.length);

  // Create a new Uint8Array from the ArrayBuffer
  const uint8Array = new Uint8Array(arrayBuffer);

  // Copy the binary string to the Uint8Array
  for (let i = 0; i < b64decoded.length; i++) {
    uint8Array[i] = b64decoded.charCodeAt(i);
  }

  const blobgzip = new Blob([uint8Array], {
    type: "application/octet-stream",
  });

  const ds = new DecompressionStream("gzip");
  const decompressedStream = blobgzip.stream().pipeThrough(ds);

  const originalText = await new Response(decompressedStream).text();
  return originalText;
}

export function stringifyInstance(instance: {}) {
  return JSON.stringify(objectifyInstance(instance));
}

export function objectifyInstance(instance: any) {
  let ret = {};
  if (typeof instance !== "object") {
    ret[`${typeof instance}`] = instance;
  }

  for (let key in instance) {
    if (typeof instance[key] === "object") {
      ret[key] = objectifyInstance(instance[key]);
    } else if (typeof instance[key] === "function") {
      ret[key] = "function";
    } else {
      ret[key] = instance[key];
    }
  }

  return ret;
}

export function randomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export class Logger {
  private buffer: string[];
  private bufferLength: number;
  private bucketIndex: BucketInfo[];
  private outputs: Required<LogOutputs>;
  private bufferCapacity: number;

  constructor(config: LogConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG))) {
    this.buffer = [];
    this.bufferLength = 0;
    this.bufferCapacity = config.bufferCapacity
      ? config.bufferCapacity
      : DEFAULT_CONFIG.bufferCapacity;

    // Parse outputs config
    if (!config.outputs) {
      this.outputs = JSON.parse(JSON.stringify(DEFAULT_OUTPUTS));
    } else {
      this.outputs = {
        console: {
          enabled: config.outputs.console
            ? config.outputs.console.enabled
            : DEFAULT_OUTPUTS.console.enabled,
        },
        tampermonkey: {
          enabled: config.outputs.tampermonkey
            ? config.outputs.tampermonkey.enabled
            : DEFAULT_OUTPUTS.tampermonkey.enabled,
          bucketIndexKey:
            config.outputs.tampermonkey &&
            config.outputs.tampermonkey.bucketIndexKey
              ? config.outputs.tampermonkey.bucketIndexKey
              : DEFAULT_OUTPUTS.tampermonkey.bucketIndexKey,
          maxBuckets:
            config.outputs.tampermonkey &&
            config.outputs.tampermonkey.maxBuckets
              ? config.outputs.tampermonkey.maxBuckets
              : DEFAULT_OUTPUTS.tampermonkey.maxBuckets,
        },
        callback: config.outputs.callback ? config.outputs.callback : undefined,
      };
    }

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
          let stale = this.buffer.shift();
          this.bufferLength -= stale.length;
        }
      }
    }
  }

  trace(message: string, context?: Object) {
    this.log(message, {
      level: LogLevel.TRACE,
      stacktrace: new Error().stack.slice(13), // Remove the "Error\n    at "
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
    const style = `background: ${STYLES[label].background}; color: ${STYLES[label].color}; font-weight: bold; border-radius: 4px;`;

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

    for (let i = this.bucketIndex.length - 1; i >= 0; i--) {
      // Get name from index
      const bucket = this.bucketIndex[i];
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
