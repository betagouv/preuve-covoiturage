import { NewableType } from '../shared/NewableType';
import { AbstractType } from '../shared/AbstractType';

export type IdentifierType<T = any> = string | symbol | NewableType<T> | AbstractType<T>;
