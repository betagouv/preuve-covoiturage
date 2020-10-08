import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

@command()
export class FindInactiveCommand implements CommandInterface {
  static readonly signature: string = 'users:inactive';
  static readonly description: string = 'Find inactive users';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-m, --months <months>',
      description: 'Interval in months',
      default: 6,
    },
  ];

  constructor(private repo: UserRepositoryProviderInterfaceResolver) {}

  public async call(options): Promise<string> {
    const users = await this.repo.findInactive(options.months);

    console.log(`
    > Inactive users for the last ${options.months} months or more
      (use user:inactive -m <number> to set a different interval)
    `);

    console.table(
      users.map((row) => {
        row.ago = row.ago.replace('0 years ', '');
        return row;
      }),
    );

    return '';
  }
}
