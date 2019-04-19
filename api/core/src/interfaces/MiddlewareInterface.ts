import { CallType } from '../types/CallType';

export type MiddlewareInterface = (call: CallType, next: Function) => void;
