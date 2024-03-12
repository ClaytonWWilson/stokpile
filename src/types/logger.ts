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

export const LogContext = z.record(z.any());

export type LogContext = z.infer<typeof LogContext>;

export const LogMeta = z.object({
  level: z.nativeEnum(LogLevel),
  time: z.date(),
});

export type LogMeta = z.infer<typeof LogMeta>;

export interface LogData {
  message: string;
  meta: LogMeta;
  context: LogContext;
}
