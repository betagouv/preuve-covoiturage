import { ServiceContainerInterface } from "../core/ServiceContainerInterface.ts";

export type HookInterface = (
  container?: ServiceContainerInterface,
) => Promise<void> | void;
