import { ResultType } from '../types/ResultType';
import { CommandOptionType } from '../types/CommandOptionType';
import { CommandInterface } from '../interfaces/CommandInterface';

export abstract class Command implements CommandInterface {
  public readonly signature: string;
  public readonly description: string;
  public readonly options: CommandOptionType[] = [];

  public async call(...args: any[]):Promise<ResultType> {
    throw new Error('No implementation found');
  }
}

