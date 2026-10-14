import { command } from "@/ilos/common/Decorators.ts";
import { CommandInterface, ValidatorInterfaceResolver } from "@/ilos/common/index.ts";
import { taggedLogger } from "@/lib/logger/tagged.ts";
import { CompanyDataSourceProviderInterfaceResolver } from "@/pdc/services/company/interfaces/CompanyDataSourceProviderInterface.ts";
import { CompanyRepositoryProviderInterfaceResolver } from "@/pdc/services/company/interfaces/CompanyRepositoryProviderInterface.ts";
import { aliasCommand } from "../contracts/fetch.schema.ts";

const log = taggedLogger("[company]", { maxLength: 512 });

export type Options = {
  save: boolean;
};

@command({
  signature: "company:fetch <siret>",
  description: "Fetch company data",
  options: [
    {
      signature: "-s, --save",
      description: "Save the fetched data to the database",
      default: false,
    },
  ],
})
export class FetchCommand implements CommandInterface {
  constructor(
    private datasource: CompanyDataSourceProviderInterfaceResolver,
    private repository: CompanyRepositoryProviderInterfaceResolver,
    private validator: ValidatorInterfaceResolver,
  ) {}

  public async call(siret: string, options: Options): Promise<void> {
    // Validate SIRET format
    try {
      log.debug("validating siret", { siret });
      this.validator.registerValidator({
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: "siret",
        type: "object",
        properties: { siret: { macro: "siret" } },
        required: ["siret"],
      });

      await this.validator.validate(siret, aliasCommand);
    } catch (error) {
      log.error("invalid siret", { siret, error: error.message });
    }

    // Fetch company data from the INSEE SIRENE API
    log.debug("fetching", { siret });

    try {
      const data = await this.datasource.find(siret);

      if (options.save) {
        log.debug("saving", { siret });
        await this.repository.updateOrCreate(data);
      }

      log.info("fetched", { siret, legal_name: data.legal_name });
    } catch (error) {
      log.error("fetch failed", { siret, error: error.message });
    }
  }
}
