import { get } from 'lodash';
import { dbBeforeMacro, dbAfterMacro, DbContextInterface } from './dbTestMacro';
import anyTest, { TestFn } from 'ava';

const test = anyTest as TestFn<DbContextInterface>;

test.before(async (t) => {
  t.context = await dbBeforeMacro();
});

test.after(async(t) => {
  await dbAfterMacro(t.context);
});

// create a macro
const members = test.macro({
  exec: async (t, table: string, expected: number) => {
    const res = await t.context.tmpConnection.getClient().query(`select count(*) from ${table}`);
    t.is(res.rowCount, 1);
    t.is(Number(get(res.rows[0], 'count', -1)), expected);
  },
  title(providedTitle = '', table: string, expected: number) {
    return providedTitle || `Check ${table} has ${expected} members`;
  }
});

// run tests
test.serial(members, 'common.roles', 7);
test.serial(members, 'auth.users', 10);
test.serial(members, 'company.companies', 4);
test.serial(members, 'operator.operators', 2);
test.serial(members, 'application.applications', 2);
test.serial(members, 'territory.territories', 60);
test.serial(members, 'carpool.identities', 10);
test.serial(members, 'acquisition.acquisitions', 100);
test.serial(members, 'carpool.carpools', 100 * 2);
