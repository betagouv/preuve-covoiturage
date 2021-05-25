interface Credentials {
  login: string;
  password: string;
  homepage: string;
}
export const usersCredentials = new Map<string, Credentials>([
  [
    'administrateur du registre',
    {
      login: process.env.REGISTRY_ADMIN_USERNAME ?? 'admin@example.com',
      password: process.env.REGISTRY_ADMIN_PASSWORD ?? 'admin1234',
      homepage: '/trip/stats',
    },
  ],
  [
    "administrateur d'un territoire",
    {
      login: process.env.TERRITORY_ADMIN_USERNAME ?? 'territory@example.com',
      password: process.env.TERRITORY_ADMIN_PASSWORD ?? 'admin1234',
      homepage: '/campaign',
    },
  ],
  [
    'compte découverte',
    {
      login: process.env.TERRITORY_DEMO_USERNAME ?? 'demo@example.com',
      password: process.env.TERRITORY_DEMO_PASSWORD ?? 'admin1234',
      homepage: '/campaign',
    },
  ],
  [
    "administrateur d'un opérateur",
    {
      login: process.env.OPERATOR_ADMIN_USERNAME ?? 'operator@example.com',
      password: process.env.OPERATOR_ADMIN_PASSWORD ?? 'admin1234',
      homepage: '/trip/stats',
    },
  ],
]);

export function getUserCredentials(name: string = 'administrateur du registre'): Credentials {
  return usersCredentials.get(name);
}
