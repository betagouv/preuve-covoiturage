import test from 'ava';

import { reduceRoles } from './reduceRoles';

test('Reduce roles: admin', (t) => {
  const roles = ['admin'];
  t.true(roles.reduce(reduceRoles(roles, 'registry', 'admin'), true));
});

test('Reduce roles: super admin', (t) => {
  const roles = ['superadmin'];
  t.true(roles.reduce(reduceRoles(roles, 'registry', 'admin'), true));
});

test('Reduce roles: admin registry', (t) => {
  const roles = ['admin', 'registry'];
  t.true(roles.reduce(reduceRoles(roles, 'registry', 'admin'), true));
});

test('Reduce roles: registry admin (inverted)', (t) => {
  const roles = ['registry', 'admin'];
  t.true(roles.reduce(reduceRoles(roles, 'registry', 'admin'), true));
});

test('Reduce roles: user', (t) => {
  const roles = ['user', 'admin'];
  t.false(roles.reduce(reduceRoles(roles, 'registry', 'admin'), true));
});

test('Reduce roles: unknown', (t) => {
  const roles = ['unknown'];
  t.false(roles.reduce(reduceRoles(roles, 'registry', 'admin'), true));
});
