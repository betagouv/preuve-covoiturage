import { provider } from '@ilos/common';
import { AbstractTripIdentityCheck } from './AbstractTripIdentityCheck';

@provider()
export class TripIdentityEmailCollisionCheck extends AbstractTripIdentityCheck {
  public static readonly key: string = 'tripIdentityEmailCollisionCheck';
  protected keys: string[] = ['email'];
}
