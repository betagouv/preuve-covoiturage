import { Config } from '@/config';
import { Collections } from '@/interfaces/cms/collectionsInterface';
import { Directus, DirectusOptions } from '@directus/sdk';

export const cmsHost = Config.get<string>('cms.host');
const options = Config.get<DirectusOptions>('cms.options');

export const cmsInstance = new Directus<Collections>(cmsHost, options);
export const cmsActusByPage = Config.get<number>('cms.actusByPage');
export const cmsRessourcesByPage = Config.get<number>('cms.ressourcesByPage');

export const shorten = (str:string, maxLen:number, separator = ' ', end= '...') => {
  if (str.length <= maxLen) return str;
  return `${str.substring(0, str.lastIndexOf(separator, maxLen))} ${end}`;
};

export const getNbPages = (total: number, max: number) => {
  return total / max > 1 ? Math.round(total / max) : 1
};
