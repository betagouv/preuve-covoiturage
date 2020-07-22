module.exports = {
  markdown: {
    lineNumbers: true
  },
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Ilos',
      description: 'JSON RPC microservice node framework'
    },
    '/fr/': {
      lang: 'fr-FR',
      title: 'Ilos',
      description: 'Cadriciel de microservice JSON RPC reposant sur Node'
    }
  },
  head: [
    // ['link', { rel: 'icon', href: `/logo.png` }],
    // ['link', { rel: 'manifest', href: '/manifest.json' }],
    // ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    // ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    // ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    // ['link', { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` }],
    // ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#3eaf7c' }],
    // ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
    // ['meta', { name: 'msapplication-TileColor', content: '#000000' }]
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'External', link: 'https://google.com' },
    ],
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        lastUpdated: 'Last Updated',
        nav: require('./nav/en'),
        sidebar: {
          ...require('./sidebar'),
        },
      },
      '/fr/': {
        label: 'Français',
        selectText: 'Langues',
        editLinkText: 'Éditer cette page sur Github',
        lastUpdated: 'Dernière mise à jour',
        nav: require('./nav/en'),
        sidebar: {
          ...require('./sidebar'),
        },
      },
    },
    repo: 'betagouv/ilos',
    repoLabel: 'Contribute!',
    docsRepo: 'betagouv/ilos',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: 'Help us improve this page!'
  }
}