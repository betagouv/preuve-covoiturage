import { Strapi } from '@strapi/strapi';

export default ({ strapi }: { strapi: Strapi }) => ({
  async run(ctx) {
    ctx.body = await strapi
      .plugin('betagouv')
      .service('flows')
      .run(ctx.params?.id);
  },
  async index(ctx) {
    ctx.body = await strapi
      .plugin('betagouv')
      .service('flows')
      .list();
  },
});
