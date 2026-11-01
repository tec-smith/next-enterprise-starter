type Level = "debug" | "info" | "warn" | "error";

const order: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function threshold(): number {
  const level = (process.env.LOG_LEVEL as Level | undefined) ?? "info";
  return order[level] ?? order.info;
}

/**
 * Minimal structured logger. Emits one JSON line per entry in production so
 * log platforms can index fields, and readable lines in development.
 * Swap for pino or your platform's SDK if you need transports.
 */
function write(
  level: Level,
  message: string,
  context?: Record<string, unknown>,
) {
  if (order[level] < threshold()) return;

  const sink =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.log;

  if (process.env.NODE_ENV === "production") {
    sink(
      JSON.stringify({
        level,
        time: new Date().toISOString(),
        message,
        ...context,
      }),
    );
  } else {
    sink(`[${level}] ${message}`, ...(context ? [context] : []));
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    write("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) =>
    write("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    write("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) =>
    write("error", message, context),
};

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
