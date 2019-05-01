import {
  injectable,
  METADATA_KEY,
} from 'inversify';

import { Metadata } from 'inversify/lib/planning/metadata';

import { HandlerConfig } from './ContainerInterfaces';

export function provider() {
  return function (target) {
    const metadata = new Metadata(METADATA_KEY.POST_CONSTRUCT, 'boot');
    Reflect.defineMetadata(METADATA_KEY.POST_CONSTRUCT, metadata, target);
    return injectable()(target);
  };
}

export function handler(config: HandlerConfig) {
  const { service } = config;
  let { method, version, transport } = config;

  method = method ? method : '*';
  version = version ? version : 'latest';
  transport = transport ? transport : 'local';
  return function (target) {
    Reflect.defineMetadata('rpc:service', service, target);
    Reflect.defineMetadata('rpc:method', method, target);
    Reflect.defineMetadata('rpc:version', version, target);
    Reflect.defineMetadata('rpc:transport', transport, target);
    return injectable()(target);
  };
}

export function command() { return injectable(); }
export function lib() { return injectable(); }
export { injectable } from 'inversify';
