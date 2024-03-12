import { LogContext, LogLevel, LogMeta } from "./types/logger";
import { Loggable, Storable } from "./interface/output";

export class Logger {
  private outputs: Loggable[] = [];
  private storage: Storable | undefined;
  constructor() {}

  addOutput(output: Loggable) {
    this.outputs.push(output);
    return this;
  }

  setStorage(storage: Storable) {
    this.storage = storage;
    return this;
  }

  ok() {
    // TODO: Check all outputs and storage for required props
    return this;
  }

  log(message: string, level: LogLevel, context: LogContext) {
    // const label = getLabel(level);

    const meta: LogMeta = {
      level,
      time: new Date(),
    };

    for (const output of this.outputs) {
      output.write(message, meta, context);
    }

    if (this.storage) {
      this.storage.write(message, meta, context);
    }
  }

  trace(message: string, context: LogContext = {}) {
    this.log(message, LogLevel.TRACE, {
      stacktrace: new Error().stack?.slice(13), // Remove the "Error\n    at "
      ...context,
    });
  }

  debug(message: string, context: LogContext = {}) {
    this.log(message, LogLevel.DEBUG, context);
  }

  info(message: string, context: LogContext = {}) {
    this.log(message, LogLevel.INFO, context);
  }

  warn(message: string, context: LogContext = {}) {
    this.log(message, LogLevel.WARN, context);
  }

  fatal(message: string, context: LogContext = {}) {
    this.log(message, LogLevel.FATAL, context);
  }
}
