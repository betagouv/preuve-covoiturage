import { process } from "@/deps.ts";
import { assert, assertEquals, assertRejects, it } from "@/dev_deps.ts";

import { Extensions } from "@/ilos/core/index.ts";
import * as dataSource from "../config/dataSource.ts";
import { CompanyDataSourceProvider } from "./CompanyDataSourceProvider.ts";

it("should fetch from data source with a siret id", async () => {
  if (
    !("APP_INSEE_API_KEY" in process.env) ||
    process.env.APP_INSEE_API_KEY === ""
  ) {
    assert(true);
    return;
  }
  const provider: CompanyDataSourceProvider = new CompanyDataSourceProvider(
    new Extensions.ConfigStore({
      dataSource,
    }),
  );
  const data = await provider.find("12000101100010");

  assertEquals(data.siret, "12000101100010");
  assertEquals(data.siren, "120001011");
  assertEquals(data.nic, "00010");
  assertEquals(data.legal_name, "SECRETARIAT GENERAL DU GOUVERNEMENT");
  assertEquals(data.company_naf_code, "8411Z");
  assertEquals(data.establishment_naf_code, "8411Z");
  assertEquals(data.legal_nature_code, "7120");
  // assertEquals(data.legal_nature_label, 'SECRETARIAT GENERAL DU GOUVERNEMENT');
  assertEquals(data.intra_vat, "FR58120001011");
  assertEquals(data.address, "57 RUE DE VARENNE 75007 PARIS 7");
  // assertEquals(data.lon, 2.320884);
  // assertEquals(data.lat, 48.854634);
  assertEquals(data.headquarter, true);
  assert(data.updated_at instanceof Date);
});

it("should fail with a wrong siret id", async () => {
  if (
    !("APP_INSEE_API_KEY" in process.env) ||
    process.env.APP_INSEE_API_KEY === ""
  ) {
    assert(true);
    return;
  }
  const provider: CompanyDataSourceProvider = new CompanyDataSourceProvider(
    new Extensions.ConfigStore({
      dataSource,
    }),
  );
  await assertRejects(async () => provider.find("this_is_not_a_siret"));
});
