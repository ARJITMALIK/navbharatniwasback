"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const dotenv_1 = __importDefault(require("dotenv"));
// importing environment configurations
dotenv_1.default.config();
class Logger {
    constructor() {
        this.logger = this.initializeLogger();
    }
    // Custom format for console development logger
    customFormat() {
        return winston_1.format.printf(({ level, message, timestamp, functionName }) => {
            return `[${timestamp}] [${level}] (${functionName}): ${message}`;
        });
    }
    // Method to initialize the logger based on environment
    initializeLogger() {
        const devLogger = (0, winston_1.createLogger)({
            transports: [new winston_1.transports.Console()],
            level: "info",
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }), winston_1.format.errors({ stack: true }), this.customFormat()),
        });
        const prodLogger = (0, winston_1.createLogger)({
            transports: [new winston_1.transports.Console()],
            level: "info",
            format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.errors({ stack: false }), winston_1.format.prettyPrint()),
        });
        if (process.env.ENVIRONMENT === "development") {
            return devLogger;
        }
        else {
            return prodLogger;
        }
    }
    // Additional methods for specific log levels
    info(message, functionName) {
        this.logger.info({ message, functionName });
    }
    warn(message, functionName) {
        this.logger.warn({ message, functionName });
    }
    error(message, functionName) {
        this.logger.error({ message, functionName });
    }
}
exports.default = Logger;
