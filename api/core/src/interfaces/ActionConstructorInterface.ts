import { ActionInterface } from './ActionInterface';

export interface ActionConstructorInterface {
    new (): ActionInterface;
}