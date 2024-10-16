import {
  HandlerConfigType,
  MethodNotFoundException,
} from "@/ilos/common/index.ts";

const regexp = new RegExp("^([a-z]*)@?([.0-9]*|latest):([a-zA-Z]*|\\*)$");

export function getConfigBySignature(
  signature: string,
): { service: string; method: string; version?: string } {
  try {
    const [, service, version, method] = regexp.exec(signature) || [];

    if (typeof service !== "string" || service.length === 0) {
      throw new Error(`Service could not be extracted from ${signature}`);
    }

    if (typeof method !== "string" || method.length === 0) {
      throw new Error(`Method could not be extracted from ${signature}`);
    }

    if (version && typeof version !== "string") {
      throw new Error(`Version could not be extracted from ${signature}`);
    }

    return { service, method, version: version ? version : "latest" };
  } catch {
    throw new MethodNotFoundException(`Invalid signature: ${signature}`);
  }
}

export function getSignatureByConfig(
  method: { service: string; method: string; version?: string },
): string {
  if (
    typeof method.service !== "string" ||
    typeof method.method !== "string" ||
    method.service.length === 0 ||
    method.method.length === 0
  ) {
    throw new MethodNotFoundException(
      `Invalid method object (service:${method.service}, method:${method.method}, version:${method.version})`,
    );
  }
  return `${method.service}@${
    "version" in method && method.version ? method.version : "latest"
  }:${method.method}`;
}

export function normalizeHandlerConfig(
  handlerConfig: HandlerConfigType,
): HandlerConfigType {
  let { service, method, version, signature } = handlerConfig;
  const { local, queue } = handlerConfig;

  if (
    typeof handlerConfig.signature === "string" &&
    handlerConfig.signature.length > 0
  ) {
    const signatureObject = getConfigBySignature(handlerConfig.signature);
    service = signatureObject.service;
    method = signatureObject.method;
    version = signatureObject.version;
  } else {
    if (typeof method !== "string" || method.length === 0) {
      throw new MethodNotFoundException("Method must be a string");
    }

    if (typeof service !== "string" || service.length === 0) {
      throw new MethodNotFoundException("Service must be a string");
    }

    signature = getSignatureByConfig({ method, service, version });
  }

  let containerSignature;

  if ("local" in handlerConfig) {
    containerSignature = `HandlerInterface/${signature}/${
      local ? "local" : "remote"
    }${queue ? "/async" : ""}`;
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
