import 'reflect-metadata';
import { injectable, METADATA_KEY } from 'inversify';
import { Metadata } from 'inversify/lib/planning/metadata';

import { MiddlewareConfigType, HandlerMeta, HandlerConfigType } from './types/handler';
import { ExtensionConfigurationType, extensionConfigurationMetadataKey } from './types/core/ExtensionInterface';

type AnyConfig = { [k: string]: any };

function extensionTag(config: AnyConfig) {
  return function(target) {
    Reflect.ownKeys(config).forEach((key: string) => {
      // Reflect.defineMetadata(`extension:${key}`, config[key], target.prototype);
      Reflect.defineMetadata(Symbol.for(`extension:${key}`), config[key], target);
    });
    return target;
  };
}

export function provider(config: AnyConfig = {}) {
  return function(target) {
    if ('boot' in target.prototype) {
      const metadata = new Metadata(METADATA_KEY.POST_CONSTRUCT, 'boot');
      Reflect.defineMetadata(METADATA_KEY.POST_CONSTRUCT, metadata, target);
    }

    return injectable()(extensionTag(config)(target));
  };
}

export function handler(config: HandlerConfigType & MiddlewareConfigType) {
  const { service } = config;
  // eslint-disable-next-line prefer-const
  let { method, version, local, queue, middlewares, ...other } = config;

  if (!('method' in config)) {
    method = '*';
  }
  if (!('version' in config)) {
    version = 'latest';
  }
  if (!('local' in config)) {
    local = true;
  }
  if (!('queue' in config)) {
    queue = false;
  }
  if (!('middlewares' in config)) {
    middlewares = [];
  }
  return function(target) {
    Reflect.defineMetadata(HandlerMeta.SERVICE, service, target);
    Reflect.defineMetadata(HandlerMeta.METHOD, method, target);
    Reflect.defineMetadata(HandlerMeta.VERSION, version, target);
    Reflect.defineMetadata(HandlerMeta.LOCAL, local, target);
    Reflect.defineMetadata(HandlerMeta.QUEUE, queue, target);
    Reflect.defineMetadata(HandlerMeta.MIDDLEWARES, middlewares, target);
    return injectable()(extensionTag(other)(target));
  };
}

export function serviceProvider(config: AnyConfig) {
  return function(target) {
    return extensionTag(config)(target);
  };
}

export function kernel(config: AnyConfig) {
  return function(target) {
    return extensionTag(config)(target);
  };
}

export function command() {
  return injectable();
}
export function middleware() {
  return injectable();
}
export function lib() {
  return injectable();
}

export function extension(config: ExtensionConfigurationType) {
  const defaultConfig = {
    override: false,
    autoload: false,
    require: [],
  };

  return function(target) {
    const normalizedConfig = { ...defaultConfig, ...config };

    if (!('key' in normalizedConfig)) {
      normalizedConfig.key = Symbol.for(`container:${normalizedConfig.name}`);
    }

    if (!('decoratorKey' in normalizedConfig)) {
      normalizedConfig.decoratorKey = Symbol.for(`extension:${normalizedConfig.name}`);
    }

    Reflect.defineMetadata(extensionConfigurationMetadataKey, normalizedConfig, target);
    return target;
  };
}

export { injectable, inject } from 'inversify';
