export default function generateToken(length = 32) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < Math.abs(length || 32); i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};
