import { provider } from '@ilos/common';
import { AbstractTripIdentityCheck } from './AbstractTripIdentityCheck';

@provider()
export class TripIdentityFirstnameCollisionCheck extends AbstractTripIdentityCheck {
  public static readonly key: string = 'tripIdentityFirstnameCollisionCheck';
  protected keys: string[] = ['firstname'];
}
