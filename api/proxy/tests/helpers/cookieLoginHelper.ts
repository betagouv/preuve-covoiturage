export async function cookieLoginHelper(request: any, email: string, password: string): Promise<string> {
  const res = await request.post('/login').send({ email, password });
  const re = new RegExp('; path=/; httponly', 'gi');

  // Save the cookie to use it later to retrieve the session
  if (!res.headers['set-cookie']) {
    throw new Error('Failed to set cookie');
  }

  return res.headers['set-cookie'].map((r: string) => r.replace(re, '')).join('; ');
}
