import { CallInterface } from './communication/CallInterface';

export type MiddlewareInterface = (call: CallInterface, next: Function) => void;
