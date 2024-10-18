import { ResultType } from "../call/index.ts";
import { CommandOptionType } from "./CommandOptionType.ts";

export interface CommandOptions {
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
  readonly description?: string;

  /**
   * Options of the command
   * @type {CommandOptionType[]}
   * @memberof CommandStaticInterface
   */
  readonly options?: CommandOptionType[];
}

export interface CommandInterface {
  /**
   * Command handler, put here your business logic
   * @param {...any[]} args
   * @returns {Promise<ResultType>}
   * @memberof CommandInterface
   */
  call(...args: unknown[]): Promise<ResultType>;
}
