import { get } from 'lodash';
import { fixturesMacro, MacroTestContext } from './fixturesMacro';
import { ExecutionContext } from 'ava';

const { test } = fixturesMacro();

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
test(members, 'common.roles', 7);
test(members, 'auth.users', 10);
test(members, 'company.companies', 4);
test(members, 'operator.operators', 2);
test(members, 'application.applications', 2);
test(members, 'territory.territories', 2);
test(members, 'common.insee', 58);
test(members, 'territory.insee', 58);
test(members, 'carpool.identities', 10);
test(members, 'acquisition.acquisitions', 100);
test(members, 'carpool.carpools', 100 * 2);
