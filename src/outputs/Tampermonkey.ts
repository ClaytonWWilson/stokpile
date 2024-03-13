import { Buffered } from "../interface/output";
import {
  StrictTampermonkeyOutputConfig,
  TampermonkeyBucketInfo,
  TampermonkeyOutputConfig,
} from "../types/output";
import { gzip, randomString, ungzip } from "../lib/utilities";
import { LogContext, LogData, LogMeta } from "../types/logger";

export default class Tampermonkey implements Buffered {
  private buffer: LogData[];
  private bucketList: TampermonkeyBucketInfo[];
  private bufferCapacity: number;
  private bucketListKey: string;
  private maxBuckets: number;
  enabled: boolean;

  constructor(config: TampermonkeyOutputConfig = {}) {
    this.buffer = [];

    const parsedConfig = StrictTampermonkeyOutputConfig.parse(config);
    this.bucketListKey = parsedConfig.bucketListKey;
    this.enabled = parsedConfig.enabled;
    this.bufferCapacity = parsedConfig.bufferCapacity;
    this.maxBuckets = parsedConfig.maxBuckets;

    this.bucketList = GM_getValue(this.bucketListKey, []);
  }

  write(message: string, meta: LogMeta, context: LogContext): void {
    if (!this.enabled) return;
    this.buffer.push({ message, meta, context });

    if (this.buffer.length > this.bufferCapacity) {
      this.flush();
    }
  }

  async read(
    entries: number
  ): Promise<{ message: string; meta: LogMeta; context: LogContext }[]> {
    if (!this.enabled) return Promise.resolve([]);

    // Check if the buffer has the requested amount
    if (this.buffer.length >= entries) {
      return Promise.resolve(this.buffer.slice(this.buffer.length - entries));
    }

    let logs = [...this.buffer];

    for (const bucket of this.bucketList) {
      // Get data from bucket
      const gzipped = <string | undefined>GM_getValue(bucket.name, undefined);
      if (gzipped === undefined) {
        console.error("Bucket does not exist on disk", bucket);
        continue;
      }
      // Ungzip and parse
      const ungzipped = await ungzip(gzipped);
      let lines: LogData[];
      try {
        lines = JSON.parse(ungzipped) as LogData[];
      } catch (err) {
        // Bucket has invalid or empty data
        lines = [];
      }
      // prepend to logs up to amount
      if (logs.length + lines.length < entries) {
        // TODO: Need to grab more from storage
        logs.unshift(...lines);
      } else if (logs.length + lines.length == entries) {
        // Have the exact amount
        logs.unshift(...lines);
        break;
      } else {
        // Grab a slice of the exact amount needed
        logs.unshift(...lines.slice(0, entries - logs.length));
        break;
      }
    }

    return logs;
  }

  async flush() {
    // Clear buffer
    const stringifiedBuffer = JSON.stringify(this.buffer);
    this.buffer = [];

    // Don't flush unless tampermonkey output is enabled
    if (!this.enabled) return;

    // Generate non-clashing name
    let newBucketName = randomString(10).toLowerCase();
    while (GM_getValue(newBucketName, undefined) !== undefined) {
      newBucketName = randomString(10);
    }

    // GZip data
    const gzipped = await gzip(stringifiedBuffer);

    // Update bucketList with info
    const newBucket: TampermonkeyBucketInfo = {
      name: newBucketName,
      size: gzipped.length,
      createdAt: new Date().valueOf(),
    };

    // Write bucketList to disk
    this.bucketList.push(newBucket);
    GM_setValue(this.bucketListKey, this.bucketList);

    // Write gzipped data to new bucket
    GM_setValue(newBucketName, gzipped);

    if (this.bucketList.length <= this.maxBuckets) {
      return;
    }

    // Delete old buckets if the number is too large
    let oldBuckets = this.bucketList
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, -this.bufferCapacity);

    oldBuckets.forEach((oldBucket) => {
      GM_deleteValue(oldBucket.name);
      let deleteIndex = this.bucketList.findIndex(
        (indexBucket) => indexBucket.name === oldBucket.name
      );

      if (deleteIndex === -1) {
        console.error("Invalid index for bucket");
        return;
      }

      this.bucketList.splice(deleteIndex, 1);
    });

    // Update tampermonkey bucket index
    GM_setValue(this.bucketListKey, this.bucketList);
  }
}
