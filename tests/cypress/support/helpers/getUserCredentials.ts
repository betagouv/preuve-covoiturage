interface Credentials {
  login: string;
  password: string;
}
export const usersCredentials = new Map<string, Credentials>([
  [
    'administrateur du registre',
    {
      login: process.env.REGISTRY_ADMIN_USERNAME ?? 'admin@example.com',
      password: process.env.REGISTRY_ADMIN_PASSWORD ?? 'admin1234',
    },
  ],
]);

export function getUserCredentials(name: string = 'administrateur du registre'): Credentials {
  return usersCredentials.get(name);
}
