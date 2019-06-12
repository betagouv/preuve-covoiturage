import { ResultType } from '../types/ResultType';
import { CommandOptionType } from '../types/CommandOptionType';

export interface CommandInterface {
  /**
   * Signature is an unique identifier for command
   */
  readonly signature: string;

  /**
   * Description of the command
   */
  readonly description: string;

  /**
   * Options of the command
   */
  readonly options: CommandOptionType[];

  /**
   * Command handler, put here your business logic
   */
  call(...args: any[]): Promise<ResultType>;
}
