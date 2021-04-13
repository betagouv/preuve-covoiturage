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
    logo: 'https://vuepress.vuejs.org/hero.png',
    locales: {
      '/': {
        nav: [
          { text: 'Partners', link: '/partners/' },
          { text: 'Contribute', link: '/contribute/' },
        ],
        sidebar: {
          '/partners/': [
            {
              title: 'Preuves de covoiturage',
              path: '/partners/preuves/',
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
              path: '/partners/visibilite-du-nom-de-loperateur',
            },
            {
              title: 'Générer une attestation',
              path: '/partners/generer-attestation',
            },
            {
              title: 'Outils',
              path: '/partners/outils',
            },
          ],
          '/contribute/repo/': 'auto',
          '/contribute/app/': 'auto',
          '/contribute/api/': [
            {
              title: 'API',
              path: '/contribute/api/',
            },
            {
              title: 'Proxy',
              path: '/contribute/api/proxy',
            },
            {
              title: 'Services',
              path: '/contribute/api/services/',
              children: getChildren('/contribute/api/services'),
            },
            {
              title: 'Providers',
              path: '/contribute/api/providers/',
              children: getChildren('/contribute/api/providers'),
            },
            {
              title: 'Licences',
              path: '/contribute/api/licenses-list',
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
