import expressMung from 'express-mung';

export const openCorsInDev = expressMung.json((body, req, res) => {
  if (process.env.NODE_ENV !== 'dev') return;

  // get the origin domain from the request
  const protocol = `http${req.connection.encrypted ? 's' : ''}`;
  const origin = req.get('origin') ? req.get('origin') : req.get('host');

  // filter out using a whitelist
  if (['localhost:4200', 'dev.covoiturage.beta.gouv.fr'].indexOf(origin) === -1) return;

  // override the Access-Control-Allow-Origin header with the calling Origin
  // to let the request pass. This is required due to the presence
  // of Access-Control-Allow-Credentials being true
  res.header('Access-Control-Allow-Origin', `${protocol}://${origin}`);
});
