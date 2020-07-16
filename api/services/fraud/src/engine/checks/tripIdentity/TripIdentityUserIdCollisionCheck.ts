import { provider } from '@ilos/common';
import { AbstractTripIdentityCheck } from './AbstractTripIdentityCheck';

@provider()
export class TripIdentityUserIdCollisionCheck extends AbstractTripIdentityCheck {
  public static readonly key: string = 'tripIdentityUserIdCollisionCheck';
  protected keys: string[] = ['operator_id', 'operator_user_id'];
}
