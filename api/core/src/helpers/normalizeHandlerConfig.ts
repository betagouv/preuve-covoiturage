import { HandlerConfig } from '../Container';

import { MethodNotFoundException } from '../exceptions/MethodNotFoundException';

const regexp = new RegExp('^([a-z]*)@?([\.0-9]*|latest):([a-z]*|\\*)$');
// const fullregexp = new RegExp('^(?:HandlerInterface\/)?([a-z]*)@?([\.0-9]*|latest):([a-z]*|\\*)\/?(local)?\/?(queue)?$');

export function getConfigBySignature(method: string): { service: string, method: string, version?: string } {
  try {
    const [_expr, s, v, m] = regexp.exec(method);
    if (typeof s !== 'string' || typeof m !== 'string' || s.length === 0 || m.length === 0) {
      throw new Error();
    }
    return {
      service: s,
      method: m,
      version: v ? v : 'latest',
    };
  } catch (e) {
    throw new MethodNotFoundException(`Invalid method string (${method})`);
  }
}

export function getSignatureByConfig(method: { service: string, method: string, version?: string }): string {
  if (
      typeof method.service !== 'string' ||
      typeof method.method !== 'string' ||
      method.service.length === 0 ||
      method.method.length === 0
    ) {
    throw new MethodNotFoundException(
      `Invalid method object (service:${method.service}, method:${method.method}, version:${method.version})`,
    );
  }
  return `${method.service}@${('version' in method && method.version) ? method.version : 'latest'}:${method.method}`;
}

export function normalizeHandlerConfig(handlerConfig: HandlerConfig): HandlerConfig {
  let {
    service,
    method,
    version,
    signature,
  } = handlerConfig;
  const {
    local,
    queue,
  } = handlerConfig;

  if ('signature' in handlerConfig) {
    const signatureObject = getConfigBySignature(handlerConfig.signature);
    service = signatureObject.service;
    method = signatureObject.method;
    version = signatureObject.version;
  } else {
    signature = getSignatureByConfig({
      method,
      service,
      version,
    });
  }

  let containerSignature;

  if ('local' in handlerConfig) {
    containerSignature = `HandlerInterface/${signature}/${local ? 'local' : 'remote'}${queue ? '/async' : ''}`;
  }

  return {
    service,
    method,
    version,
    local,
    queue,
    containerSignature,
  };
}
