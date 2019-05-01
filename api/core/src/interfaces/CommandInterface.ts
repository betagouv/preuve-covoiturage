import { ResultType } from '../types/ResultType';
import { CommandOptionType } from '../types/CommandOptionType';

export interface CommandInterface {
  readonly signature: string;
  readonly description: string;
  readonly options: CommandOptionType[];

  call(...args: any[]): Promise<ResultType>;
}
