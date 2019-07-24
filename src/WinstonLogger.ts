import * as path from 'path';
import * as Winston from "winston";
import { TransformableInfo, Format } from 'logform';

type ErrorReplacer = (error: Error) => Format;
type Replacer = (key: string, value: any) => any;


// define the custom settings for each transport (file, console)
const options : any = {
	file: (fileName : string) : any => {
		return {
			level: 'info',
			filename: path.resolve(
				__dirname, 
				'..',
				'logs',
				fileName
			),
			handleExceptions: true,
			json: true,
			maxsize: 5242880, // 5MB
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

function CreateLogger(logLevel : string, fileName? : string) : Winston.Logger {
	return Winston.createLogger({
		transports: getTransports(fileName),
		level: logLevel,
		format: getFormat(),
		exitOnError: false, // do not exit on handled exceptions
	});
}

function getTransports(fileName? : string) : any {
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

function getFormat() : Format {
	if (process.env.NODE_ENV === 'production') {
		return prodFormat();
	} else {
		return devFormat();
	}
}

function prodFormat() : Format {
	const replaceError : ErrorReplacer = (error: Error): Format => { 
		return new Format({
			label: error.name, 
			level: "error", 
			message: error.message, 
			stack: error.stack
		});
	};
	const replacer : Replacer = (key: string, value: any) : any => value instanceof Error ? 
		replaceError(value) : 
		value;
	return Winston.format.combine(
		Winston.format.label({ label: 'ssr server log' }), 
		Winston.format.json({ replacer })
	);
}

type DevMessageFormater = (info: TransformableInfo) => string;

function devFormat() : Format {
	const formatMessage : DevMessageFormater = (info : TransformableInfo) : string => {
		return `${info.level} ${info.message}`;
	};
	const formatError : DevMessageFormater = (info : TransformableInfo) : string => {
		return `${info.level} ${info.message}\n\n${info.stack}\n`;
	};
	const format : DevMessageFormater = (info : TransformableInfo): string => {
		return info instanceof Error ? formatError(info) : formatMessage(info);
	};
	return Winston.format.combine(
		Winston.format.colorize(), 
		Winston.format.printf(format)
	);
}

export default CreateLogger;