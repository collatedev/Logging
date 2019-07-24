import ILogger from "./ILogger";
import winston = require("winston");
import CreateLogger from "./WinstonLogger";

export default class Logger implements ILogger {
    private winstonLogger : winston.Logger;

    constructor(level: string, fileName : string) {
        this.winstonLogger = CreateLogger(level, fileName);
    }

    public warn(message : string) : void {
        this.winstonLogger.warn(message);
    }

    public error(message : string) : void {
        this.winstonLogger.error(message);
    }

    public debug(message : string) : void {
        this.winstonLogger.debug(message);
    }

    public info(message : string) : void {
        this.winstonLogger.info(message);
    }
}