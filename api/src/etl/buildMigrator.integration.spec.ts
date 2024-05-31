import anyTest, { TestFn } from 'ava';
import { Pool } from 'pg';
import { buildMigrator } from './buildMigrator.js';
import { Migrator } from './Migrator.js';
import { EurostatCountries2020 } from './datasets/eurostat/countries/2020/EurostatCountries2020.js';
import { EurostatSimplifiedCountries2020 } from './datasets/eurostat/countries/2020/EurostatSimplifiedCountries2020.js';
import { IgnAe2019 } from './datasets/ign/admin_express/2019/IgnAe2019.js';
import { IgnAe2020 } from './datasets/ign/admin_express/2020/IgnAe2020.js';
import { IgnAe2021 } from './datasets/ign/admin_express/2021/IgnAe2021.js';
import { IgnAe2022 } from './datasets/ign/admin_express/2022/IgnAe2022.js';
import { IgnAe2023 } from './datasets/ign/admin_express/2023/IgnAe2023.js';
import { CreateGeoTable } from './datastructure/000_CreateGeoTable.js';
import { createPool } from './helpers/index.js';
import { InseePerim2019 } from './datasets/insee/perimetres/2019/InseePerim2019.js';
import { InseePerim2020 } from './datasets/insee/perimetres/2020/InseePerim2020.js';
import { InseePerim2021 } from './datasets/insee/perimetres/2021/InseePerim2021.js';
import { InseePerim2022 } from './datasets/insee/perimetres/2022/InseePerim2022.js';
import { InseePerim2023 } from './datasets/insee/perimetres/2023/InseePerim2023.js';
import { InseeDep2021 } from './datasets/insee/departements/2021/InseeDep2021.js';
import { InseeDep2022 } from './datasets/insee/departements/2022/InseeDep2022.js';
import { InseeDep2023 } from './datasets/insee/departements/2023/InseeDep2023.js';
import { InseeReg2021 } from './datasets/insee/regions/2021/InseeReg2021.js';
import { InseeReg2022 } from './datasets/insee/regions/2022/InseeReg2022.js';
import { InseeReg2023 } from './datasets/insee/regions/2023/InseeReg2023.js';
import { CeremaAom2019 } from './datasets/cerema/aom/2019/CeremaAom2019.js';
import { CeremaAom2020 } from './datasets/cerema/aom/2020/CeremaAom2020.js';
import { CeremaAom2021 } from './datasets/cerema/aom/2021/CeremaAom2021.js';
import { CeremaAom2022 } from './datasets/cerema/aom/2022/CeremaAom2022.js';
import { CeremaAom2023 } from './datasets/cerema/aom/2023/CeremaAom2023.js';
import { DgclBanatic2021 } from './datasets/dgcl/banatic/2021/DgclBanatic2021.js';
import { DgclBanatic2022 } from './datasets/dgcl/banatic/2022/DgclBanatic2022.js';
import { DgclBanatic2023 } from './datasets/dgcl/banatic/2023/DgclBanatic2023.js';
import { config } from './config.js';
import { CreateComEvolutionTable } from './datastructure/001_CreateComEvolutionTable.js';
import { InseeMvtcom2021 } from './datasets/insee/mvt_communaux/2021/InseeMvtcom2021.js';
import { InseeMvtcom2022 } from './datasets/insee/mvt_communaux/2022/InseeMvtcom2022.js';
import { InseeMvtcom2023 } from './datasets/insee/mvt_communaux/2023/InseeMvtcom2023.js';
import { InseeCom2021 } from './datasets/insee/communes/2021/InseeCom2021.js';
import { InseeCom2022 } from './datasets/insee/communes/2022/InseeCom2022.js';
import { InseeCom2023 } from './datasets/insee/communes/2023/InseeCom2023.js';
import { MemoryStateManager } from './providers/MemoryStateManager.js';
import { InseePays2021 } from './datasets/insee/pays/2021/InseePays2021.js';
import { InseePays2022 } from './datasets/insee/pays/2022/InseePays2022.js';
import { InseePays2023 } from './datasets/insee/pays/2023/InseePays2023.js';

interface TestContext {
  connection: Pool;
  migrator: Migrator;
}

const test = anyTest as TestFn<TestContext>;

test.before(async (t) => {
  t.context.connection = createPool();
  t.context.migrator = buildMigrator(config);
  await t.context.migrator.prepare();
  t.context.connection = t.context.migrator.pool;
  for await (const migrable of [...t.context.migrator.config.datastructures, ...t.context.migrator.config.datasets]) {
    await t.context.connection.query(`
        DROP TABLE IF EXISTS ${config.app.targetSchema}.${migrable.table}
      `);
  }
});

test.after.always(async (t) => {
  for await (const migrable of [...t.context.migrator.config.datastructures, ...t.context.migrator.config.datasets]) {
    await t.context.connection.query(`
      DROP TABLE IF EXISTS ${config.app.targetSchema}.${migrable.table}
    `);
  }
});
test.serial('should create com_evolution table', async (t) => {
  await t.context.migrator.process(CreateComEvolutionTable, new MemoryStateManager());
  const count = await t.context.connection.query(`SELECT count(*) FROM com_evolution`);
  t.is(count.rows[0].count, '0');
});

test.serial('should do migration InseeMvtcom2021', async (t) => {
  await t.context.migrator.process(InseeMvtcom2021, new MemoryStateManager());
  const count = await t.context.connection.query(`SELECT count(*) FROM com_evolution where year = 2021`);
  t.is(count.rows[0].count, '638');
});

test.serial('should do migration InseeMvtcom2022', async (t) => {
  await t.context.migrator.process(InseeMvtcom2022, new MemoryStateManager());
  const count = await t.context.connection.query(`SELECT count(*) FROM com_evolution where year = 2022`);
  t.is(count.rows[0].count, '638');
});

test.serial('should do migration InseeMvtcom2023', async (t) => {
  await t.context.migrator.process(InseeMvtcom2023, new MemoryStateManager());
  const count = await t.context.connection.query(`SELECT count(*) FROM com_evolution where year = 2023`);
  t.is(count.rows[0].count, '638');
});

test.serial('should create perimeters table', async (t) => {
  await t.context.migrator.process(CreateGeoTable, new MemoryStateManager());
  const count = await t.context.connection.query(`SELECT count(*) FROM perimeters`);
  t.is(count.rows[0].count, '0');
});

test.serial('should do migration IgnAe2019', async (t) => {
  await t.context.migrator.process(IgnAe2019, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2019 order by arr asc limit 1`);
  t.is(first.rows[0].arr, '01001');
  t.is(first.rows[0].pop, 767);
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2019 order by arr desc limit 1`);
  t.is(last.rows[0].arr, '97617');
  t.is(last.rows[0].pop, 13934);
  const count = await t.context.connection.query(`SELECT count(*) FROM perimeters where year = 2019`);
  t.is(count.rows[0].count, '35015');
});

test.serial('should do migration IgnAe2020', async (t) => {
  await t.context.migrator.process(IgnAe2020, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2020 order by arr asc limit 1`);
  t.is(first.rows[0].arr, '01001');
  t.is(first.rows[0].pop, 776);
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2020 order by arr desc limit 1`);
  t.is(last.rows[0].arr, '97617');
  t.is(last.rows[0].pop, 13934);
  const count = await t.context.connection.query(`SELECT count(*) FROM perimeters where year = 2020`);
  t.is(count.rows[0].count, '35013');
});

test.serial('should do migration IgnAe2021', async (t) => {
  await t.context.migrator.process(IgnAe2021, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2021 order by arr asc limit 1`);
  t.is(first.rows[0].arr, '01001');
  t.is(first.rows[0].pop, 771);
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2021 order by arr desc limit 1`);
  t.is(last.rows[0].arr, '97617');
  t.is(last.rows[0].pop, 13934);
  const count = await t.context.connection.query(`SELECT count(*) FROM perimeters where year = 2021`);
  t.is(count.rows[0].count, '35010');
});

test.serial('should do migration IgnAe2022', async (t) => {
  await t.context.migrator.process(IgnAe2022, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2022 order by arr asc limit 1`);
  t.is(first.rows[0].arr, '01001');
  t.is(first.rows[0].pop, 771);
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2022 order by arr desc limit 1`);
  t.is(last.rows[0].arr, '97617');
  t.is(last.rows[0].pop, 13934);
  const count = await t.context.connection.query(`SELECT count(*) FROM perimeters where year = 2022`);
  t.is(count.rows[0].count, '35010');
});

test.serial('should do migration IgnAe2023', async (t) => {
  await t.context.migrator.process(IgnAe2023, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2023 order by arr asc limit 1`);
  t.is(first.rows[0].arr, '01001');
  t.is(first.rows[0].pop, 771);
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2023 order by arr desc limit 1`);
  t.is(last.rows[0].arr, '97617');
  t.is(last.rows[0].pop, 13934);
  const count = await t.context.connection.query(`SELECT count(*) FROM perimeters where year = 2023`);
  t.is(count.rows[0].count, '35010');
});

test.serial('should do migration EurostatCountries2020', async (t) => {
  await t.context.migrator.process(EurostatCountries2020, new MemoryStateManager());
  const count = await t.context.connection.query(`SELECT count(*) FROM eurostat_countries_2020`);
  t.is(count.rows[0].count, '257');
});

test.serial('should do migration EurostatSimplifiedCountries2020', async (t) => {
  await t.context.migrator.process(EurostatSimplifiedCountries2020, new MemoryStateManager());
  const count = await t.context.connection.query(`SELECT count(*) FROM eurostat_simplified_countries_2020`);
  t.is(count.rows[0].count, '257');
});

test.serial('should do migration InseePays2021', async (t) => {
  await t.context.migrator.process(InseePays2021, new MemoryStateManager());
  const count = await t.context.connection.query(`SELECT count(distinct country) 
  FROM public.perimeters where year = 2021`);
  t.is(count.rows[0].count, '208');
});

test.serial('should do migration InseePays2022', async (t) => {
  await t.context.migrator.process(InseePays2022, new MemoryStateManager());
  const count = await t.context.connection.query(`SELECT count(distinct country) FROM public.perimeters 
  where year = 2022`);
  t.is(count.rows[0].count, '208');
});

test.serial('should do migration InseePays2023', async (t) => {
  await t.context.migrator.process(InseePays2023, new MemoryStateManager());
  const count = await t.context.connection.query(`SELECT count(distinct country) FROM public.perimeters 
  where year = 2023`);
  t.is(count.rows[0].count, '208');
});

test.serial('should do migration Inseecom2021', async (t) => {
  await t.context.migrator.process(InseeCom2021, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where arr='75101' 
  and year=2021 order by arr asc limit 1`);
  t.is(first.rows[0].com, '75056');
});

test.serial('should do migration Inseecom2022', async (t) => {
  await t.context.migrator.process(InseeCom2022, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where arr='75101' 
  and year=2022 order by arr asc limit 1`);
  t.is(first.rows[0].com, '75056');
});

test.serial('should do migration Inseecom2023', async (t) => {
  await t.context.migrator.process(InseeCom2023, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where arr='75101' 
  and year=2023 order by arr asc limit 1`);
  t.is(first.rows[0].com, '75056');
});

test.serial('should do migration InseePerim2019', async (t) => {
  await t.context.migrator.process(InseePerim2019, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2019 order by arr asc limit 1`);
  t.is(first.rows[0].dep, '01');
  t.is(first.rows[0].epci, '200069193');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2019 order by arr desc limit 1`);
  t.is(last.rows[0].dep, '976');
  t.is(last.rows[0].epci, '200059871');
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where l_arr IS NOT NULL AND year = 2019`,
  );
  t.is(count.rows[0].count, '35015');
});

test.serial('should do migration InseePerim2020', async (t) => {
  await t.context.migrator.process(InseePerim2020, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2020 order by arr asc limit 1`);
  t.is(first.rows[0].dep, '01');
  t.is(first.rows[0].epci, '200069193');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2020 order by arr desc limit 1`);
  t.is(last.rows[0].dep, '976');
  t.is(last.rows[0].epci, '200059871');
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where l_arr IS NOT NULL AND year = 2020`,
  );
  t.is(count.rows[0].count, '35013');
});

test.serial('should do migration InseePerim2021', async (t) => {
  await t.context.migrator.process(InseePerim2021, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2021 order by arr asc limit 1`);
  t.is(first.rows[0].dep, '01');
  t.is(first.rows[0].epci, '200069193');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2021 order by arr desc limit 1`);
  t.is(last.rows[0].dep, '976');
  t.is(last.rows[0].epci, '200059871');
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where l_arr IS NOT NULL AND year = 2021`,
  );
  t.is(count.rows[0].count, '35010');
});

test.serial('should do migration InseePerim2022', async (t) => {
  await t.context.migrator.process(InseePerim2022, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2022 order by arr asc limit 1`);
  t.is(first.rows[0].dep, '01');
  t.is(first.rows[0].epci, '200069193');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2022 order by arr desc limit 1`);
  t.is(last.rows[0].dep, '976');
  t.is(last.rows[0].epci, '200059871');
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where l_arr IS NOT NULL AND year = 2022`,
  );
  t.is(count.rows[0].count, '35010');
});

test.serial('should do migration InseePerim2023', async (t) => {
  await t.context.migrator.process(InseePerim2023, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2023 order by arr asc limit 1`);
  t.is(first.rows[0].dep, '01');
  t.is(first.rows[0].epci, '200069193');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2023 order by arr desc limit 1`);
  t.is(last.rows[0].dep, '976');
  t.is(last.rows[0].epci, '200059871');
  const count = await t.context.connection.query(
    `SELECT count(*) FROM perimeters where l_arr IS NOT NULL AND year = 2023`,
  );
  t.is(count.rows[0].count, '35010');
});

test.serial('should do migration InseeDep2021', async (t) => {
  await t.context.migrator.process(InseeDep2021, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2021 order by arr asc limit 1`);
  t.is(first.rows[0].l_dep, 'Ain');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2021 order by arr desc limit 1`);
  t.is(last.rows[0].l_dep, 'Mayotte');
  const count = await t.context.connection.query(`SELECT count(distinct l_dep) FROM perimeters where year = 2021`);
  t.is(count.rows[0].count, '101');
});

test.serial('should do migration InseeDep2022', async (t) => {
  await t.context.migrator.process(InseeDep2022, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2022 order by arr asc limit 1`);
  t.is(first.rows[0].l_dep, 'Ain');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2022 order by arr desc limit 1`);
  t.is(last.rows[0].l_dep, 'Mayotte');
  const count = await t.context.connection.query(`SELECT count(distinct l_dep) FROM perimeters where year = 2022`);
  t.is(count.rows[0].count, '101');
});

test.serial('should do migration InseeDep2023', async (t) => {
  await t.context.migrator.process(InseeDep2023, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2023 order by arr asc limit 1`);
  t.is(first.rows[0].l_dep, 'Ain');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2023 order by arr desc limit 1`);
  t.is(last.rows[0].l_dep, 'Mayotte');
  const count = await t.context.connection.query(`SELECT count(distinct l_dep) FROM perimeters where year = 2023`);
  t.is(count.rows[0].count, '101');
});

test.serial('should do migration InseeReg2021', async (t) => {
  await t.context.migrator.process(InseeReg2021, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2021 order by arr asc limit 1`);
  t.is(first.rows[0].l_reg, 'Auvergne-Rhône-Alpes');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2021 order by arr desc limit 1`);
  t.is(last.rows[0].l_reg, 'Mayotte');
  const count = await t.context.connection.query(`SELECT count(distinct l_reg) FROM perimeters where year = 2021`);
  t.is(count.rows[0].count, '18');
});

test.serial('should do migration InseeReg2022', async (t) => {
  await t.context.migrator.process(InseeReg2022, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2022 order by arr asc limit 1`);
  t.is(first.rows[0].l_reg, 'Auvergne-Rhône-Alpes');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2022 order by arr desc limit 1`);
  t.is(last.rows[0].l_reg, 'Mayotte');
  const count = await t.context.connection.query(`SELECT count(distinct l_reg) FROM perimeters where year = 2022`);
  t.is(count.rows[0].count, '18');
});

test.serial('should do migration InseeReg2023', async (t) => {
  await t.context.migrator.process(InseeReg2023, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2023 order by arr asc limit 1`);
  t.is(first.rows[0].l_reg, 'Auvergne-Rhône-Alpes');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2023 order by arr desc limit 1`);
  t.is(last.rows[0].l_reg, 'Mayotte');
  const count = await t.context.connection.query(`SELECT count(distinct l_reg) FROM perimeters where year = 2023`);
  t.is(count.rows[0].count, '18');
});

test.serial('should do migration CeremaAom2019', async (t) => {
  await t.context.migrator.process(CeremaAom2019, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2019 order by arr asc limit 1`);
  t.is(first.rows[0].aom, null);
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2019 order by arr desc limit 1`);
  t.is(last.rows[0].aom, null);
  const count = await t.context.connection.query(`SELECT count(distinct l_aom) FROM perimeters where year = 2019`);
  t.is(count.rows[0].count, '336');
});

test.serial('should do migration CeremaAom2020', async (t) => {
  await t.context.migrator.process(CeremaAom2020, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2020 order by arr asc limit 1`);
  t.is(first.rows[0].aom, null);
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2020 order by arr desc limit 1`);
  t.is(last.rows[0].aom, null);
  const count = await t.context.connection.query(`SELECT count(distinct l_aom) FROM perimeters where year = 2020`);
  t.is(count.rows[0].count, '273');
});

test.serial('should do migration CeremaAom2021', async (t) => {
  await t.context.migrator.process(CeremaAom2021, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2021 order by arr asc limit 1`);
  t.is(first.rows[0].aom, null);
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2021 order by arr desc limit 1`);
  t.is(last.rows[0].aom, null);
  const count = await t.context.connection.query(`SELECT count(distinct l_aom) FROM perimeters where year = 2021`);
  t.is(count.rows[0].count, '334');
});

test.serial('should do migration CeremaAom2022', async (t) => {
  await t.context.migrator.process(CeremaAom2022, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2022 order by arr asc limit 1`);
  t.is(first.rows[0].aom, null);
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2022 order by arr desc limit 1`);
  t.is(last.rows[0].aom, null);
  const count = await t.context.connection.query(`SELECT count(distinct l_aom) FROM perimeters where year = 2022`);
  t.is(count.rows[0].count, '334');
});

test.serial('should do migration CeremaAom2023', async (t) => {
  await t.context.migrator.process(CeremaAom2023, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2023 order by arr asc limit 1`);
  t.is(first.rows[0].aom, null);
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2023 order by arr desc limit 1`);
  t.is(last.rows[0].aom, null);
  const count = await t.context.connection.query(`SELECT count(distinct l_aom) FROM perimeters where year = 2023`);
  t.is(count.rows[0].count, '334');
});

test.serial('should do migration DgclBanatic2021', async (t) => {
  await t.context.migrator.process(DgclBanatic2021, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2021 order by arr asc limit 1`);
  t.is(first.rows[0].aom, '200053767');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2021 order by arr desc limit 1`);
  t.is(last.rows[0].aom, '229850003');
  const count = await t.context.connection.query(`SELECT count(distinct l_aom) FROM perimeters where year = 2021`);
  t.is(count.rows[0].count, '739');
});

test.serial('should do migration DgclBanatic2022', async (t) => {
  await t.context.migrator.process(DgclBanatic2022, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2022 order by arr asc limit 1`);
  t.is(first.rows[0].aom, '200053767');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2022 order by arr desc limit 1`);
  t.is(last.rows[0].aom, '229850003');
  const count = await t.context.connection.query(`SELECT count(distinct l_aom) FROM perimeters where year = 2022`);
  t.is(count.rows[0].count, '739');
});

test.serial('should do migration DgclBanatic2023', async (t) => {
  await t.context.migrator.process(DgclBanatic2023, new MemoryStateManager());
  const first = await t.context.connection.query(`SELECT * FROM perimeters where year = 2023 order by arr asc limit 1`);
  t.is(first.rows[0].aom, '200053767');
  const last = await t.context.connection.query(`SELECT * FROM perimeters where year = 2023 order by arr desc limit 1`);
  t.is(last.rows[0].aom, '229850003');
  const count = await t.context.connection.query(`SELECT count(distinct l_aom) FROM perimeters where year = 2023`);
  t.is(count.rows[0].count, '739');
});

test.serial.skip('should import', async (t) => {
  await t.context.migrator.run();
  const count = await t.context.connection.query(`SELECT count(*) FROM perimeters`);
  t.is(count.rows[0].count, '404');
});
