import { CommandInterface, CommandOptionType, ResultType } from '@ilos/common';

/**
 * Command parent class, must be decorated
 * @export
 * @abstract
 * @class Command
 * @implements {CommandInterface}
 */
export abstract class Command implements CommandInterface {
  static readonly signature: string;
  static readonly description: string;
  static readonly options: CommandOptionType[] = [];

  public async call(...args: any[]): Promise<ResultType> {
    throw new Error('No implementation found');
  }
}
