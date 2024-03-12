import { LogContext, LogMeta } from "../types/logger";

export abstract class Loggable {
  abstract write(message: string, meta: LogMeta, context: LogContext): void;
}

export abstract class Storable extends Loggable {
  abstract read(
    entries: number
  ): Promise<{ message: string; meta: LogMeta; context: LogContext }[]>;
}
