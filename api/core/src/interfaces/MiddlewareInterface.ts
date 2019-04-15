import { CallInterface } from './CallInterface';

export interface MiddlewareInterface {
  (call: CallInterface, next: Function): void;
}
