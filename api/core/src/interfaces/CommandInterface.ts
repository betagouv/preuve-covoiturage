import { ProviderInterface } from './ProviderInterface';
import { ResultType } from '../types/ResultType';
import { CommandOptionType } from '../types/CommandOptionType';

export interface CommandInterface extends ProviderInterface {
  readonly signature: string;
  readonly description: string;
  readonly options: CommandOptionType[];

  boot():Promise<void> | void;
  call(...args: any[]): Promise<ResultType>;
}
