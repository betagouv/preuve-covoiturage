import { expect } from 'chai';
import { describe } from 'mocha';

import { reduceRoles } from './reduceRoles';

describe('reduce roles', () => {
  it('works: admin', async () => {
    const roles = ['admin'];

    const pass = roles.reduce(reduceRoles(roles, 'registry', 'admin'), true);

    await expect(pass).to.be.true;
  });

  it('works: super admin', async () => {
    const roles = ['superadmin'];

    const pass = roles.reduce(reduceRoles(roles, 'registry', 'admin'), true);

    await expect(pass).to.be.true;
  });

  it('works: admin registry', async () => {
    const roles = ['admin', 'registry'];

    const pass = roles.reduce(reduceRoles(roles, 'registry', 'admin'), true);

    await expect(pass).to.be.true;
  });

  it('works: registry admin (inverted)', async () => {
    const roles = ['registry', 'admin'];

    const pass = roles.reduce(reduceRoles(roles, 'registry', 'admin'), true);

    await expect(pass).to.be.true;
  });

  it('fails: admin, user', async () => {
    const roles = ['user', 'admin'];

    const pass = roles.reduce(reduceRoles(roles, 'registry', 'admin'), true);

    await expect(pass).to.be.false;
  });

  it('fails: unknown', async () => {
    const roles = ['unknown'];

    const pass = roles.reduce(reduceRoles(roles, 'registry', 'admin'), true);

    await expect(pass).to.be.false;
  });
});
