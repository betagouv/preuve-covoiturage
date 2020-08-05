import { provider } from '@ilos/common';
import { AbstractTripIdentityCheck } from './AbstractTripIdentityCheck';

@provider()
export class TripIdentityTravelpassCollisionCheck extends AbstractTripIdentityCheck {
  public static readonly key: string = 'tripIdentityTravelpassCollisionCheck';
  protected keys: string[] = ['travel_pass_name', 'travel_pass_user_id'];
}
