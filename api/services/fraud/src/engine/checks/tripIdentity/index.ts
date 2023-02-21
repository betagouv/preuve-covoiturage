import { TripIdentityEmailCollisionCheck } from './TripIdentityEmailCollisionCheck';
import { TripIdentityFirstnameCollisionCheck } from './TripIdentityFirstnameCollisionCheck';
import { TripIdentityFullnameCollisionCheck } from './TripIdentityFullnameCollisionCheck';
import { TripIdentityLastnameCollisionCheck } from './TripIdentityLastnameCollisionCheck';
import { TripIdentityPhoneCollisionCheck } from './TripIdentityPhoneCollisionCheck';
import { TripIdentityPhoneTruncCollisionCheck } from './TripIdentityPhoneTruncCollisionCheck';
import { TripIdentityUserIdCollisionCheck } from './TripIdentityUserIdCollisionCheck';

export const tripIdentity = [
  TripIdentityEmailCollisionCheck,
  TripIdentityFirstnameCollisionCheck,
  TripIdentityFullnameCollisionCheck,
  TripIdentityLastnameCollisionCheck,
  TripIdentityPhoneCollisionCheck,
  TripIdentityPhoneTruncCollisionCheck,
  TripIdentityUserIdCollisionCheck,
];
