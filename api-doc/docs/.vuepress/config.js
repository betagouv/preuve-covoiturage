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
          { text: 'App', link: '/app/' },
          { text: 'API', link: '/api/' },
        ],
        sidebar: {
          '/app/': 'auto',
          '/api/': [
            {
              title: 'API',
              path: '/api/',
            },
            {
              title: 'Infrastructure',
              path: '/api/infra',
            },
            {
              title: 'Proxy',
              path: '/api/proxy',
            },
            {
              title: 'Services',
              path: '/api/services/',
              children: getChildren('/api/services'),
            },
            {
              title: 'Providers',
              path: '/api/providers/',
              children: getChildren('/api/providers'),
            },
            {
              title: 'Licences',
              path: '/api/licenses-list',
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
