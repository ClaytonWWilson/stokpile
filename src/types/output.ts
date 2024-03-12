import { LogContext, LogMeta } from "logger";
import { z } from "zod";

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

export const ConsoleOutputConfig = z.object({
  enabled: z.boolean().default(true).optional(),
  style: ConsoleStyles,
});

export type ConsoleOutputConfig = z.infer<typeof ConsoleOutputConfig>;

export const StrictConsoleOutputConfig = z.object({
  enabled: z.boolean().default(true),
  style: StrictConsoleStyles,
});

export type StrictConsoleOutputConfig = z.infer<
  typeof StrictConsoleOutputConfig
>;

export const TampermonkeyOutputConfig = z
  .object({
    enabled: z.boolean().default(false).optional(),
    maxBuckets: z.number().default(10).optional(),
    bufferCapacity: z.number().default(10000).optional(),
    bucketListKey: z.string().default("bucket_index").optional(),
  })
  .default({})
  .optional();

export type TampermonkeyOutputConfig = z.infer<typeof TampermonkeyOutputConfig>;

export const StrictTampermonkeyOutputConfig = z
  .object({
    enabled: z.boolean().default(true),
    maxBuckets: z.number().default(10),
    bufferCapacity: z.number().default(10000),
    bucketListKey: z.string().default("bucket_index"),
  })
  .default({});

export type StrictTampermonkeyOutputConfig = z.infer<
  typeof StrictTampermonkeyOutputConfig
>;

export interface TampermonkeyBucketInfo {
  name: string;
  size: number;
  createdAt: number;
}

export interface CallbackOutputConfig {
  enabled: boolean;
  callback:
    | ((message: string, meta: LogMeta, context: LogContext) => void)
    | ((message: string, meta: LogMeta, context: LogContext) => Promise<void>)
    | undefined;
}
