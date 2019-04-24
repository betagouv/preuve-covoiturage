import { CommandConstructorInterface } from './CommandConstructorInterface';

export interface ProviderInterface {
  readonly signature: string;
  commands?: CommandConstructorInterface[];

  boot():Promise<void> | void;
}
