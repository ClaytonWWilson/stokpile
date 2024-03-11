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

export interface LogMeta {
  context: LogContext;
  time: number;
}

export interface BucketInfo {
  name: string;
  size: number;
  createdAt: number;
}
