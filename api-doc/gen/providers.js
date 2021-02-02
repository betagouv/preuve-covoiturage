const fs = require('fs');

module.exports = {
  genProviders(config) {
    // loop through providers
    for (const provider of fs.readdirSync(config.providersRoot)) {
      const sourcePath = `${config.providersRoot}/${provider}/src`;

      const content = fs.existsSync(`${sourcePath}/../README.md`)
        ? fs.readFileSync(`${sourcePath}/../README.md`, { encoding: 'utf-8', flag: 'r' }).trim()
        : '```\n// TODO\n```';

      // create folder and file
      const target = `${config.root}/docs/api/providers/${provider}`;
      if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
      fs.writeFileSync(`${target}/index.md`, content);
    }
  },
};
