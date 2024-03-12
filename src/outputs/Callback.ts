import { LogContext, LogMeta } from "../types/logger";
import { Loggable } from "../interface/output";
import { CallbackOutputConfig } from "../types/output";

export default class Callback implements Loggable {
  private callback:
    | ((message: string, meta: LogMeta, context: LogContext) => void)
    | ((message: string, meta: LogMeta, context: LogContext) => Promise<void>)
    | undefined;
  enabled: boolean;
  constructor(config: CallbackOutputConfig) {
    this.enabled = config.enabled;
    this.callback = config.callback;
  }
  write(message: string, meta: LogMeta, context: LogContext): void {
    if (this.callback) {
      this.callback(message, meta, context);
    }
  }
}
