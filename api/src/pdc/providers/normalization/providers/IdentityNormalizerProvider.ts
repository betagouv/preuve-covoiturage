import { provider } from '/ilos/common/index.ts';
import { IdentityNormalizerProviderInterface, IdentityParamsInterface, IdentityResultInterface } from '../interfaces/index.ts';

@provider()
export class IdentityNormalizerProvider implements IdentityNormalizerProviderInterface {
  public async handle(identity: IdentityParamsInterface): Promise<IdentityResultInterface> {
    if ('travel_pass' in identity && typeof identity === 'object') {
      const id = {
        ...identity,
        travel_pass_name: identity.travel_pass.name,
        travel_pass_user_id: identity.travel_pass.user_id,
      };

      delete id.travel_pass;
      return id;
    }

    return identity;
  }
}
