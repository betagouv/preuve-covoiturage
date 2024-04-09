const { fs, path } = require('@vuepress/shared-utils');

module.exports = {
  dest: './dist',
  locales: {
    '/': {
      lang: 'fr-FR',
      title: '📚 RPC tech',
      description: 'Documentation technique du Registre de preuve de covoiturage',
    },
  },
  theme: 'openapi',
  themeConfig: {
    logo: '/logo-rpc.png',
    locales: {
      '/': {
        nav: [
          { text: 'Opérateurs', link: '/operateurs/' },
          { text: 'Développeurs', link: '/contribuer/api/' },
          { text: 'Repo', link: '/contribuer/repo/' },
        ],
        sidebar: {
          '/operateurs/': [
            {
              title: 'API Trajets',
              children: [
                {
                  title: "Accès",
                  path: 'acces',
                },
                {
                  title: "Référence API V3.0",
                  path: 'api-v3',
                },
                {
                  title: "Référence API V2.0 (dépréciée)",
                  path: 'api-v2',
                },
                {
                  title: "Exports de trajets",
                  path: 'exports-de-trajets',
                },
                {
                  title: 'Limites',
                  path: 'limites',
                },
              ],
            },
            {
              title: 'API CEE',
              path: '/operateurs/cee',
            },
            {
              title: 'Attestations',
              children: [
                {
                  title: "Fonctionnalités",
                  path: 'attestations/fonctionnalites'
                },
                {
                  title: "Exemples",
                  path: 'attestations/exemples'
                },
              ],
            },
            {
              title: 'Outils',
              path: '/operateurs/outils',
            },
          ],
          '/contribuer/repo/': [
            {
              title: 'Repository',
              path: '/contribuer/repo/'
            },
            {
              title: 'CI/CD',
              path: '/contribuer/repo/cicd'
            }
          ],
          '/contribuer/api/': [
            {
              title: 'API',
              path: '/contribuer/api/',
            },
            {
              title: 'Proxy',
              path: '/contribuer/api/proxy',
            },
            {
              title: 'Services',
              path: '/contribuer/api/services/',
              children: getChildren('/contribuer/api/services'),
            },
            {
              title: 'Providers',
              path: '/contribuer/api/providers/',
              children: getChildren('/contribuer/api/providers'),
            },
            {
              title: 'Licences',
              path: '/contribuer/api/licenses-list',
            },
            {
              title: 'Gestion des dates',
              path: '/contribuer/api/dates',
            },
          ],
        },
      },
    },
  },
};

function getChildren(fullPath) {
  return fs
    .readdirSync(path.resolve(__dirname, `../${fullPath}`))
    .filter((s) => !new RegExp('.md$', 'i').test(s))
    .map((s) => `${fullPath}/${s}/`)
    .sort();
}
