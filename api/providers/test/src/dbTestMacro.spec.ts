import { get } from 'lodash';
import { dbTestMacro, MacroTestContext } from './dbTestMacro';
import test, { ExecutionContext } from 'ava';

const { test: macroTest } = dbTestMacro(test);

// create a macro
const members = async (t: ExecutionContext<MacroTestContext>, table: string, expected: number): Promise<void> => {
  const res = await t.context.pool.query(`select count(*) from ${table}`);
  t.is(res.rowCount, 1);
  t.is(Number(get(res.rows[0], 'count', -1)), expected);
};

// set the macro title dynamically
members.title = (providedTitle: string | undefined, table: string, expected: number): string =>
  providedTitle || `Check ${table} has ${expected} members`;

// run tests
macroTest(members, 'common.roles', 7);
macroTest(members, 'auth.users', 10);
macroTest(members, 'company.companies', 4);
macroTest(members, 'operator.operators', 2);
macroTest(members, 'application.applications', 2);
macroTest(members, 'territory.territories', 2);
macroTest(members, 'common.insee', 58);
macroTest(members, 'territory.insee', 58);
macroTest(members, 'carpool.identities', 10);
macroTest(members, 'acquisition.acquisitions', 100);
macroTest(members, 'carpool.carpools', 100 * 2);
