import { Logger } from "pino";
import { generateLoggerConfigByEnvironment } from "./logger.utils";

export const logger: Logger = generateLoggerConfigByEnvironment();
