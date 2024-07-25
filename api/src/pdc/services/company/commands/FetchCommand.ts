import { command } from "@/ilos/common/Decorators.ts";
import {
  CommandInterface,
  CommandOptionType,
  ValidatorInterfaceResolver,
} from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { CompanyDataSourceProviderInterfaceResolver } from "@/pdc/services/company/interfaces/CompanyDataSourceProviderInterface.ts";
import { CompanyRepositoryProviderInterfaceResolver } from "@/pdc/services/company/interfaces/CompanyRepositoryProviderInterface.ts";
import { alias } from "@/shared/company/fetch.schema.ts";

export type Options = {
  save: boolean;
};

@command()
export class FetchCommand implements CommandInterface {
  static readonly signature: string = "company:fetch <siret>";
  static readonly description: string = "Fetch company data";
  static readonly options: CommandOptionType[] = [
    {
      signature: "-s, --save",
      description: "Save the fetched data to the database",
      default: false,
    },
  ];

  constructor(
    private datasource: CompanyDataSourceProviderInterfaceResolver,
    private repository: CompanyRepositoryProviderInterfaceResolver,
    private validator: ValidatorInterfaceResolver,
  ) {}

  public async call(siret: string, options: Options): Promise<void> {
    // Validate SIRET format
    try {
      logger.info("Validating SIRET format...");
      this.validator.registerValidator({
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: "siret",
        type: "object",
        properties: { siret: { macro: "siret" } },
        required: ["siret"],
      });

      await this.validator.validate(siret, alias);
    } catch (error) {
      logger.error(error.message);
      logger.error(this.validator.errors);
    }

    // Fetch company data from the INSEE SIRENE API
    logger.log(`Fetching company data for SIRET ${siret}...`);

    try {
      const data = await this.datasource.find(siret);

      if (options.save) {
        logger.info("Saving fetched data to the database...");
        await this.repository.updateOrCreate(data);
      }

      logger.info(data);
    } catch (error) {
      logger.error(error.message);
    }
  }
}
