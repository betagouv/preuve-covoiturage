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
          { text: 'Contribuer', link: '/contribuer/' },
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
                  title: "Schema d'envoi JSON",
                  path: 'preuves/schema',
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
                  title: 'Limites',
                  path: 'preuves/limites',
                },
              ],
            },
            {
              title: 'Visibilité opérateur',
              path: '/operateurs/visibilite-du-nom-de-loperateur',
            },
            {
              title: 'Générer une attestation',
              path: '/operateurs/generer-attestation',
            },
            {
              title: 'Outils',
              path: '/operateurs/outils',
            },
          ],
          '/contribuer/repo/': 'auto',
          '/contribuer/app/': 'auto',
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
