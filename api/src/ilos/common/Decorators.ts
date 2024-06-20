import { injectable, METADATA_KEY } from "@/deps.ts";
import type { ExtensionConfigurationType } from "./types/core/ExtensionInterface.ts";
import { extensionConfigurationMetadataKey } from "./types/core/ExtensionInterface.ts";
import type {
  HandlerConfigType,
  MiddlewareConfigType,
} from "./types/handler/index.ts";
import { HandlerMeta } from "./types/handler/index.ts";

type AnyConfig = { [k: string]: any };

function extensionTag(config: AnyConfig) {
  return function (target: any) {
    Reflect.ownKeys(config).forEach((key: string | symbol) => {
      // Reflect.defineMetadata(`extension:${key}`, config[key], target.prototype);
      const k = String(key);
      Reflect.defineMetadata(
        Symbol.for(`extension:${k}`),
        config[k],
        target,
      );
    });
    return target;
  };
}

class Metadata {
  public key: string | number | symbol;
  public value: unknown;

  public constructor(
    key: string | number | symbol,
    value: unknown,
  ) {
    this.key = key;
    this.value = value;
  }

  public toString() {
    if (this.key === METADATA_KEY.NAMED_TAG) {
      return `named: ${String(this.value).toString()} `;
    } else {
      return `tagged: { key:${this.key.toString()}, value: ${
        String(this.value)
      } }`;
    }
  }
}

export function provider(config: AnyConfig = {}) {
  return function (target: any) {
    if ("boot" in target.prototype) {
      const metadata = new Metadata(METADATA_KEY.POST_CONSTRUCT, "boot");
      Reflect.defineMetadata(METADATA_KEY.POST_CONSTRUCT, metadata, target);
    }

    return injectable()(extensionTag(config)(target));
  };
}

export function handler(config: HandlerConfigType & MiddlewareConfigType) {
  const { service } = config;
  // eslint-disable-next-line prefer-const
  let { method, version, local, queue, middlewares, ...other } = config;

  if (!("method" in config)) {
    method = "*";
  }
  if (!("version" in config)) {
    version = "latest";
  }
  if (!("local" in config)) {
    local = true;
  }
  if (!("queue" in config)) {
    queue = false;
  }
  if (!("middlewares" in config)) {
    middlewares = [];
  }
  return function (target: any) {
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
  return function (target: any) {
    return extensionTag(config)(target);
  };
}

export function kernel(config: AnyConfig) {
  return function (target: any) {
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

  return function (target: any) {
    const normalizedConfig = { ...defaultConfig, ...config };

    if (!("key" in normalizedConfig)) {
      normalizedConfig.key = Symbol.for(`container:${normalizedConfig.name}`);
    }

    if (!("decoratorKey" in normalizedConfig)) {
      normalizedConfig.decoratorKey = Symbol.for(
        `extension:${normalizedConfig.name}`,
      );
    }

    Reflect.defineMetadata(
      extensionConfigurationMetadataKey,
      normalizedConfig,
      target,
    );
    return target;
  };
}

export { inject, injectable } from "@/deps.ts";
