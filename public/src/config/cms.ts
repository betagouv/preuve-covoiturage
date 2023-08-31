import { DirectusOptions } from '@directus/sdk';
import { ConfigObject } from '.';

type CmsConfig = ConfigObject & {
  options: DirectusOptions;
};

export const cms: CmsConfig = {
  host: process.env.NEXT_PUBLIC_CMS_URL,
  options: {},
  actusByPage: 10,
  ressourcesByPage: 10
};