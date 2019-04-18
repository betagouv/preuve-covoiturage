import { CallInterface } from './CallInterface';

export type MiddlewareInterface = (call: CallInterface, next: Function) => void;
