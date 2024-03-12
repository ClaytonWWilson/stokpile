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

export interface LogContext {
  [key: string]: any;
}

export interface LogMeta {
  level: LogLevel;
  time: Date;
}

export interface LogData {
  message: string;
  meta: LogMeta;
  context: LogContext;
}
