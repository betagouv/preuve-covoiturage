import {
  ConfigInterfaceResolver,
  handler,
  HandlerInterface,
  InitHookInterface,
  NewableType,
} from "@/ilos/common/index.ts";

import { HttpHandler } from "../HttpHandler.ts";
/**
 * httpHandlerFactory - Create a HttpHandler for a remote service
 * @export
 * @param {string} service - service name
 * @param {string} url - service url
 * @param {string} [version]
 * @returns {NewableType<HandlerInterface>}
 */
export function httpHandlerFactory(
  service: string,
  url: string,
  version?: string,
): NewableType<HandlerInterface & InitHookInterface> {
  let isFromConfig = false;
  if (!/http/.test(url)) {
    isFromConfig = true;
  }
  @handler({
    service,
    version,
    method: "*",
    local: false,
  })
  class CustomHttpHandler extends HttpHandler {
    constructor(private config: ConfigInterfaceResolver) {
      super();
    }

    protected readonly service: string = service;
    protected readonly version: string = version;

    public init() {
      if (isFromConfig) {
        this.createClient(this.config.get(url));
      } else {
        this.createClient(url);
      }
    }
  }

  return CustomHttpHandler;
}
