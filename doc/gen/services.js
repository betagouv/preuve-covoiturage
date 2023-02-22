/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const { getTopComment, printBase } = require('./helpers');

function printActions(actions) {
  const content = actions
    .filter((s) => s !== '')
    .join('\n\n')
    .trim();

  if (!content.length) return '';

  return `
## Actions

${content}
`;
}

module.exports = {
  genServices(config) {
    // loop through services
    for (const service of fs.readdirSync(config.servicesRoot)) {
      const actions = [];
      const sourcePath = `${config.servicesRoot}/${service}/src`;

      // get general service doc from ServiceProvider.ts
      const sp = fs.existsSync(`${sourcePath}/../README.md`)
        ? fs.readFileSync(`${sourcePath}/../README.md`, { encoding: 'utf-8', flag: 'r' })
        : getTopComment(fs.readFileSync(`${sourcePath}/ServiceProvider.ts`, { encoding: 'utf-8', flag: 'r' }));

      // get actions' doc
      for (const action of fs.readdirSync(`${sourcePath}/actions`).filter((s) => /Action\.ts$/.test(s))) {
        const top = fs.readFileSync(`${sourcePath}/actions/${action}`, { encoding: 'utf-8', flag: 'r' });
        actions.push(getTopComment(top));
      }

      // prepare Markdown content
      const content = `${printBase(sp)}
${printActions(actions)}
`.trim();

      // create folder and file
      const target = `${config.root}/docs/contribuer/api/services/${service}`;
      if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
      fs.writeFileSync(`${target}/index.md`, content.length ? content : '```\n// TODO\n```');
    }
  },
};
