import { ExtensionInterface, NewableType } from "@/ilos/common/index.ts";
import {
  Config,
  Handlers,
  Middlewares,
  Providers,
} from "../extensions/index.ts";
import { ServiceContainer } from "./ServiceContainer.ts";

/**
 * Service provider parent class
 * @export
 * @abstract
 * @class ServiceProvider
 * @implements {ServiceProviderInterface}
 */
export abstract class ServiceProvider extends ServiceContainer {
  readonly extensions: NewableType<ExtensionInterface>[] = [
    Config,
    Middlewares,
    Providers,
    Handlers,
  ];
}
