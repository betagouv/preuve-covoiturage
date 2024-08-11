
import anyTest, { TestFn } from 'ava';
import { KeycloakManager } from './KeycloakManager.js';

interface TestContext {
  provider: KeycloakManager;
}

const test = anyTest as TestFn<TestContext>;

const user1 = {
  firstName: 'Jean',
  lastName: 'Dupond',
  email: 'registry@admin.com',
  attributes: {
    phone: '+33601020304',
    pdc_role: 'registry.admin',
  }
};

const user2 = {
  firstName: 'Jeanne',
  lastName: 'Dupuis',
  email: 'territory@admin.com',
  attributes: {
    phone: '+33601020304',
    pdc_role: 'territory.admin',
    territory_id: 12,
  }
};

test.before((t) => {
  t.context.provider = new KeycloakManager();
});

test.after.always(async (t) => {
  const result = await t.context.provider.listUser();
  for(const user of result.filter(u => u.email == user1.email || u.email == user2.email)) {
    await t.context.provider.deleteUser(user.id);
  }
});

test.serial('Should list user', async (t) => {
  const result = await t.context.provider.listUser();
  t.is(result.length, 1);
});

test.serial('Should create a user', async (t) => {
  await t.context.provider.createUser(user1);
  await t.context.provider.createUser(user2);
  const result = await t.context.provider.listUser();
  t.like(result.find(u => u.email == user1.email), user1);
  t.like(result.find(u => u.email == user2.email), user2);
});
