import { command, CommandInterface } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { UserRepositoryProviderInterfaceResolver } from "../interfaces/UserRepositoryProviderInterface.ts";

@command({
  signature: "users:inactive",
  description: "Find inactive users",
  options: [
    {
      signature: "-m, --months <months>",
      description: "Interval in months",
      default: 6,
    },
  ],
})
export class FindInactiveCommand implements CommandInterface {
  constructor(private repo: UserRepositoryProviderInterfaceResolver) {}

  public async call(options: { months: number }): Promise<string> {
    const users = await this.repo.findInactive(options.months);

    logger.info(`
    > Inactive users for the last ${options.months} months or more
      (use user:inactive -m <number> to set a different interval)
    `);

    logger.info(
      users.map((row) => {
        row.ago = row.ago.replace("0 years ", "");
        return row;
      }),
    );

    return "";
  }
}
