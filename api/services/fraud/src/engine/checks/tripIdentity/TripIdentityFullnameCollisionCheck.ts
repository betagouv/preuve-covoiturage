import { provider } from '@ilos/common';
import { AbstractTripIdentityCheck } from './AbstractTripIdentityCheck';

@provider()
export class TripIdentityFullnameCollisionCheck extends AbstractTripIdentityCheck {
  public static readonly key: string = 'tripIdentityFullnameCollisionCheck';
  protected keys: string[] = ['lastname', 'firstname'];
}
