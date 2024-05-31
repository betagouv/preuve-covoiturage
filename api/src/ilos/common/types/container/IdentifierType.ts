import { NewableType } from '../shared/NewableType.ts';
import { AbstractType } from '../shared/AbstractType.ts';

export type IdentifierType<T = any> = string | symbol | NewableType<T> | AbstractType<T>;
