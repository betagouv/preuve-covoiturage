import { provider } from '@ilos/common';
import { AbstractTripIdentityCheck } from './AbstractTripIdentityCheck';

@provider()
export class TripIdentityLastnameCollisionCheck extends AbstractTripIdentityCheck {
  public static readonly key: string = 'tripIdentityLastnameCollisionCheck';
  protected keys: string[] = ['lastname'];
}
