import { ServiceContainerInterface } from '../core/ServiceContainerInterface';

export type HookInterface = (container?: ServiceContainerInterface) => Promise<void> | void;
