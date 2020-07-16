import { provider } from '@ilos/common';
import { AbstractTripIdentityCheck } from './AbstractTripIdentityCheck';

@provider()
export class TripIdentityPhoneCollisionCheck extends AbstractTripIdentityCheck {
  public static readonly key: string = 'tripIdentityPhoneCollisionCheck';
  protected keys: string[] = ['phone'];
}
