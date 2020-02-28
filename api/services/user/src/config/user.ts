export const defaultLimit = 1000;
export const defaultSkip = 0;
export const tokenExpiration = {
  // on email change, a confirmation link is sent
  confirmation: 7 * 86400,

  // the invitee has a delay to accept the invitation
  invitation: 7 * 86400,

  // password reset delay
  reset: 1 * 86400,
};
