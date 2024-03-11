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

export const ConsoleStyles = z
  .object({
    trace: z
      .object({
        backgroundColor: z.string().default("#949494").optional(),
        textColor: z.string().default("#fff").optional(),
      })
      .default({})
      .optional(),
    debug: z
      .object({
        backgroundColor: z.string().default("#fe7bf3").optional(),
        textColor: z.string().default("#fff").optional(),
      })
      .default({})
      .optional(),
    info: z
      .object({
        backgroundColor: z.string().default("#65f10e").optional(),
        textColor: z.string().default("#fff").optional(),
      })
      .default({})
      .optional(),
    warn: z
      .object({
        backgroundColor: z.string().default("#faf200").optional(),
        textColor: z.string().default("#000").optional(),
      })
      .default({})
      .optional(),
    fatal: z
      .object({
        backgroundColor: z.string().default("#cc0018").optional(),
        textColor: z.string().default("#fff").optional(),
      })
      .default({})
      .optional(),
  })
  .optional();

export type ConsoleStyles = z.infer<typeof ConsoleStyles>;

export const StrictConsoleStyles = z
  .object({
    trace: z
      .object({
        backgroundColor: z.string().default("#949494"),
        textColor: z.string().default("#fff"),
      })
      .default({}),
    debug: z
      .object({
        backgroundColor: z.string().default("#fe7bf3"),
        textColor: z.string().default("#fff"),
      })
      .default({}),
    info: z
      .object({
        backgroundColor: z.string().default("#65f10e"),
        textColor: z.string().default("#fff"),
      })
      .default({}),
    warn: z
      .object({
        backgroundColor: z.string().default("#faf200"),
        textColor: z.string().default("#000"),
      })
      .default({}),
    fatal: z
      .object({
        backgroundColor: z.string().default("#cc0018"),
        textColor: z.string().default("#fff"),
      })
      .default({}),
  })
  .default({});

export const LogOutputs = z.object({
  console: z
    .object({
      enabled: z.boolean().default(true).optional(),
      style: ConsoleStyles,
    })
    .default({})
    .optional(),
  tampermonkey: z
    .object({
      enabled: z.boolean().default(false).optional(),
      maxBuckets: z.number().default(10).optional(),
      bucketIndexKey: z.string().default("bucket_index").optional(),
    })
    .default({})
    .optional(),
  callback: z.function().args(z.string()).optional(),
});

export type LogOutputs = z.infer<typeof LogOutputs>;

export const LogConfig = z.object({
  outputs: LogOutputs.default({}).optional(),
  bufferCapacity: z.number().default(100000).optional(),
});

export type LogConfig = z.infer<typeof LogConfig>;

export const StrictLogOutputs = z.object({
  console: z
    .object({
      enabled: z.boolean().default(true),
      style: StrictConsoleStyles,
    })
    .default({}),
  tampermonkey: z
    .object({
      enabled: z.boolean().default(false),
      maxBuckets: z.number().default(10),
      bucketIndexKey: z.string().default("bucket_index"),
    })
    .default({}),
  callback: z.function().args(z.string()).optional(),
});

export type StrictLogOutputs = z.infer<typeof StrictLogOutputs>;

export const StrictLogConfig = z.object({
  outputs: StrictLogOutputs.default({}),
  bufferCapacity: z.number().default(100000),
});

export type StrictLogConfig = z.infer<typeof StrictLogConfig>;

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

export type StrictConsoleStyles = z.infer<typeof StrictConsoleStyles>;
