import { Strapi } from '@strapi/strapi';

export default async ({ strapi }: { strapi: Strapi }) => {
  await strapi.admin.services.permission.actionProvider.registerMany([
    {
      section: 'plugins',
      displayName: 'Run flows (flush cache, deploy)',
      uid: 'flows.run',
      pluginName: 'betagouv',
    },
  ]);
};
