import { Logger } from "pino";
import { generateLoggerConfigByEnvironment } from "./utils";

export const logger: Logger = generateLoggerConfigByEnvironment();
