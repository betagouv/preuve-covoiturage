import { IdentityInterface, LegacyIdentityInterface } from './index.ts';

export type IdentityResultInterface = IdentityInterface;
export type IdentityParamsInterface = IdentityInterface | LegacyIdentityInterface;

export interface IdentityNormalizerProviderInterface {
  handle(params: IdentityParamsInterface): Promise<IdentityResultInterface>;
}
