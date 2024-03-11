import { z } from "zod";

export enum LogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  FATAL = 50,
}

export enum LogLabel {
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

export const LogOutputs = z.object({
  console: z
    .object({
      enabled: z.boolean().default(true),
    })
    .default({}),
  tampermonkey: z
    .object({
      enabled: z.boolean().default(false),
      maxBuckets: z.number().default(10),
      bucketIndexKey: z.string().default("bucket_index"),
    })
    .default({}),
  callback: z.function().args(z.string()).nullish(),
});

export type LogOutputs = z.infer<typeof LogOutputs>;

export const LogConfig = z.object({
  outputs: LogOutputs.default({}),
  bufferCapacity: z.number().default(100000),
});

export type LogConfig = z.infer<typeof LogConfig>;

export interface LogContext {
  level?: number;
  [key: string]: any;
}

export interface LogMeta {
  context: LogContext;
  time: number;
}

export interface BucketInfo {
  name: string;
  size: number;
  createdAt: number;
}

export interface ConsoleStyles {
  trace?: {
    background?: string;
    color?: string;
  };
  debug?: {
    background?: string;
    color?: string;
  };
  info?: {
    background?: string;
    color?: string;
  };
  warn?: {
    background?: string;
    color?: string;
  };
  fatal?: {
    background?: string;
    color?: string;
  };
}
