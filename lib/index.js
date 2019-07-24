"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const Winston = require("winston");
const logform_1 = require("logform");
// define the custom settings for each transport (file, console)
const options = {
    file: (fileName) => {
        return {
            level: 'info',
            filename: path.resolve(__dirname, '..', '..', 'logs', fileName),
            handleExceptions: true,
            json: true,
            maxsize: 5242880,
            maxFiles: 5,
            colorize: false
        };
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};
function CreateLogger(logLevel, fileName) {
    return Winston.createLogger({
        transports: getTransports(fileName),
        level: logLevel,
        format: getFormat(),
        exitOnError: false,
    });
}
exports.CreateLogger = CreateLogger;
function getTransports(fileName) {
    switch (process.env.NODE_ENV) {
        case 'production':
            if (fileName === undefined) {
                throw new Error("Loggers that log to a file need a file name");
            }
            return [
                new Winston.transports.File(options.file(fileName)),
                new Winston.transports.Console(options.console)
            ];
        case 'development':
        case 'debug':
            return [
                new Winston.transports.Console(options.console)
            ];
        default:
            return [new Winston.transports.Console(options.console)];
    }
}
function getFormat() {
    if (process.env.NODE_ENV === 'production') {
        return prodFormat();
    }
    else {
        return devFormat();
    }
}
function prodFormat() {
    const replaceError = (error) => {
        return new logform_1.Format({
            label: error.name,
            level: "error",
            message: error.message,
            stack: error.stack
        });
    };
    const replacer = (key, value) => value instanceof Error ?
        replaceError(value) :
        value;
    return Winston.format.combine(Winston.format.label({ label: 'ssr server log' }), Winston.format.json({ replacer }));
}
function devFormat() {
    const formatMessage = (info) => {
        return `${info.level} ${info.message}`;
    };
    const formatError = (info) => {
        return `${info.level} ${info.message}\n\n${info.stack}\n`;
    };
    const format = (info) => {
        return info instanceof Error ? formatError(info) : formatMessage(info);
    };
    return Winston.format.combine(Winston.format.colorize(), Winston.format.printf(format));
}
//# sourceMappingURL=index.js.map