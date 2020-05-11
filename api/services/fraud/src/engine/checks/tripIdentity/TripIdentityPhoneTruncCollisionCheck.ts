import { provider } from '@ilos/common';
import { AbstractTripIdentityCheck } from './AbstractTripIdentityCheck';

@provider()
export class TripIdentityPhoneTruncCollisionCheck extends AbstractTripIdentityCheck {
  public static readonly key: string = 'tripIdentityPhoneTruncCollisionCheck';
  protected keys: string[] = ['phone_trunc'];
}
