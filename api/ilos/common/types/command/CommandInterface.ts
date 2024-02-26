import { CommandOptionType } from './CommandOptionType';
import { ResultType } from '../call';

export interface CommandStaticInterface {
  /**
   * Signature is an unique identifier for command
   * @type {string}
   * @memberof CommandStaticInterface
   */
  readonly signature: string;

  /**
   * Description of the command
   * @type {string}
   * @memberof CommandStaticInterface
   */
  readonly description: string;

  /**
   * Options of the command
   * @type {CommandOptionType[]}
   * @memberof CommandStaticInterface
   */
  readonly options: CommandOptionType[];

  new (...args: any): CommandInterface;
}

export interface CommandInterface {
  /**
   * Command handler, put here your business logic
   * @param {...any[]} args
   * @returns {Promise<ResultType>}
   * @memberof CommandInterface
   */
  call(...args: any[]): Promise<ResultType>;
}
