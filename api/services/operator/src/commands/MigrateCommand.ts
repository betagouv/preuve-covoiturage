import { Parents, Types } from '@ilos/cli';

export class MigrateCommand implements Parents.Command {
  signature: string;
  description: string;
  options: Types.CommandOptionType[];

  async call(...args: any[]): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
