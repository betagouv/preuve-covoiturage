import winston from 'winston';
import os from 'os';
import path from 'path';

export enum LogLevel {
  'error',
  'warn',
  'info',
  'verbose',
  'debug',
  'silly',
}

export type LoggerFileConfigurationType = winston.transports.FileTransportOptions & {
  type: 'file';
};

export type LoggerConsoleConfigurationType = winston.transports.ConsoleTransportOptions & {
  type: 'console';
};

export type LoggerConfigurationType = {
  level: keyof typeof LogLevel;
  meta?: any;
  loggers: {
    default: (LoggerConsoleConfigurationType | LoggerFileConfigurationType)[];
    [k: string]: (LoggerConsoleConfigurationType | LoggerFileConfigurationType)[];
  };
};

export const loggerDefaultConfiguration: LoggerConfigurationType = {
  level: 'error',
  loggers: {
    default: [
      {
        type: 'console',
        level: 'debug',
      },
      {
        type: 'file',
        level: 'debug',
      },
    ],
    local: [
      {
        type: 'console',
        level: 'debug',
      },
    ],
    prod: [
      {
        type: 'file',
        level: 'warning',
      },
    ],
  },
};

export const loggerDefaultFormat = winston.format.simple();

export const loggerDefaultConsoleFormat = winston.format.combine(winston.format.timestamp(), winston.format.cli());

export const loggerDefaultFileFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

export function createConsoleLogger(opts = {}) {
  return new winston.transports.Console({
    level: 'error',
    stderrLevels: ['error'],
    format: loggerDefaultConsoleFormat,
    ...opts,
  });
}

export function createFileLogger(opts = {}) {
  return new winston.transports.File({
    level: 'error',
    format: loggerDefaultFileFormat,
    filename: path.join(os.tmpdir(), 'ilos.log'),
    maxsize: 1000000,
    maxFiles: 10,
    tailable: true,
    ...opts,
  });
}

export function buildLoggerConfiguration(config: LoggerConfigurationType, env = 'default'): winston.LoggerOptions {
  const transports = env in config.loggers ? config.loggers[env] : config.loggers.default;
  return {
    level: config.level,
    defaultMeta: config.meta,
    levels: winston.config.syslog.levels,
    format: loggerDefaultFormat,
    transports: transports.map((transportConfig) => {
      const { type, ...opts } = transportConfig;
      switch (type) {
        case 'file':
          return createFileLogger(opts);
        case 'console':
          return createConsoleLogger(opts);
        default:
          throw new Error(`Unknown logger config key ${type}`);
      }
    }),
  };
}
