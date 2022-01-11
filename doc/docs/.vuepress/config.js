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
  themeConfig: {
    logo: '/logo-rpc.png',
    locales: {
      '/': {
        nav: [
          { text: 'Opérateurs', link: '/operateurs/' },
          { text: 'API', link: '/contribuer/api/' },
          { text: 'Repo', link: '/contribuer/repo/' },
        ],
        sidebar: {
          '/operateurs/': [
            {
              title: 'Preuves de covoiturage',
              path: '/operateurs/preuves/',
              children: [
                {
                  title: "Accéder à l'API",
                  path: 'preuves/acces',
                },
                {
                  title: "Envoyer un trajet",
                  path: 'preuves/envoyer-un-trajet',
                },
                {
                  title: 'Vérifier le statut',
                  path: 'preuves/statut',
                },
                {
                  title: 'Invalider un trajet',
                  path: 'preuves/invalider',
                },
                {
                  title: 'Simuler un trajet',
                  path: 'preuves/simulation',
                },
                {
                  title: 'Limites',
                  path: 'preuves/limites',
                },
              ],
            },
            {
              title: 'Attestations opérateurs',
              path: '/operateurs/attestations',
              children: [
                {
                  title: "Introduction",
                  path: "attestations/",
                },
                {
                  title: "Créer un attestation",
                  path: "attestations/creer",
                },
                {
                  title: "Télécharger",
                  path: "attestations/telecharger",
                },
                {
                  title: "Exemples",
                  path: "attestations/exemples",
                },
              ]
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
              title: 'Process',
              path: '/contribuer/repo/process'
            },
            {
              title: 'CI/CD',
              path: '/contribuer/repo/cicd'
            },
            {
              title: 'Infra',
              path: '/contribuer/repo/infra'
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
