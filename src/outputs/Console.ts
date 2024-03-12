import { LogContext, LogLabel, LogMeta } from "../types/logger";
import { Loggable } from "../interface/output";
import {
  ConsoleOutputConfig,
  StrictConsoleOutputConfig,
} from "../types/output";
import { getLabel } from "../lib/utilities";

const MESSAGE_STYLE = "background: inherit; color: inherit;";

export default class Console implements Loggable {
  private style;
  enabled: boolean;
  constructor(config: ConsoleOutputConfig = {}) {
    const parsedConfig = StrictConsoleOutputConfig.parse(config);
    this.style = parsedConfig.style;
    this.enabled = parsedConfig.enabled;
  }
  write(message: string, meta: LogMeta, context: LogContext): void {
    if (!this.enabled) return;

    const label = getLabel(meta.level);
    const styleFormatter = `background: ${this.style[label].backgroundColor}; color: ${this.style[label].textColor}; font-weight: bold; border-radius: 4px;`;

    switch (label) {
      case LogLabel.TRACE:
        console.trace(
          `%c ${label} ` + `%c ${message}`,
          styleFormatter,
          MESSAGE_STYLE,
          context
        );
        break;
      case LogLabel.DEBUG:
        console.debug(
          `%c ${label} ` + `%c ${message}`,
          styleFormatter,
          MESSAGE_STYLE,
          context
        );
        break;
      case LogLabel.INFO:
        console.info(
          `%c ${label} ` + `%c ${message}`,
          styleFormatter,
          MESSAGE_STYLE,
          context
        );
        break;
      case LogLabel.WARN:
        console.warn(
          `%c ${label} ` + `%c ${message}`,
          styleFormatter,
          MESSAGE_STYLE,
          context
        );
        break;
      case LogLabel.FATAL:
        console.error(
          `%c ${label} ` + `%c ${message}`,
          styleFormatter,
          MESSAGE_STYLE,
          context
        );
        break;
      default:
        console.log(
          `%c ${label} ` + `%c ${message}`,
          styleFormatter,
          MESSAGE_STYLE,
          context
        );
        break;
    }
  }
}
