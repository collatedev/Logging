import winston from "winston";
import CreateLogger from "../src/WinstonLogger";

describe("Logger", () => {
    const OLD_ENV : any = process.env;

	beforeEach(() => {
		jest.resetModules(); // this is important - it clears the cache
		process.env = { ...OLD_ENV };
		delete process.env.NODE_ENV;
	});

	afterEach(() => {
		process.env = OLD_ENV;
	});

    test("Creates a logger in dev", () => {
		process.env.NODE_ENV = "development";

		const logger : winston.Logger = CreateLogger('info');

		expect(logger.level).toEqual("info");
		expect(logger.transports).toHaveLength(1);
		expect(logger.transports[0].level).toEqual('debug');
	});

    test("Creates a logger in debug", () => {
		process.env.NODE_ENV = "debug";

		const logger : winston.Logger = CreateLogger('info');

		expect(logger.level).toEqual("info");
		expect(logger.transports).toHaveLength(1);
		expect(logger.transports[0].level).toEqual('debug');
	});

    test("Creates a logger in prod", () => {
		process.env.NODE_ENV = "production";
		const transportCount : number = 2;

		const logger : winston.Logger = CreateLogger('info', 'a.log');

		expect(logger.level).toEqual("info");
		expect(logger.transports).toHaveLength(transportCount);
		expect(logger.transports[0].level).toEqual('info');
		expect(logger.transports[1].level).toEqual('debug');
	});

    test("Fails to create a logger when no file name is passed", () => {
		process.env.NODE_ENV = "production";

		expect(() => {
			CreateLogger('info');
		}).toThrow(new Error("Loggers that log to a file need a file name"));
	});
});