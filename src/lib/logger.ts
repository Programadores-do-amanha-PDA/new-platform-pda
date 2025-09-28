export const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(
      JSON.stringify({ level: "info", message, meta, timestamp: new Date() })
    );
  },
  error: (message: string, error?: unknown) => {
    console.error(
      JSON.stringify({ level: "error", message, error, timestamp: new Date() })
    );
  },
  warn: (message: string, meta?: unknown) => {
    console.warn(
      JSON.stringify({ level: "warn", message, meta, timestamp: new Date() })
    );
  },
};
