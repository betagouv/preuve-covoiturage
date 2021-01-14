const fs = require('fs');

function getTopComment(str) {
  if (typeof str !== 'string') return '';
  const firstImport = str.indexOf('import {');
  const pos = str.indexOf('*/');
  if (pos === -1 || firstImport < pos) return '';
  return str
    .substr(0, pos)
    .replace(/^ ?\* ?/gm, '')
    .replace('/**', '')
    .trim();
}

function printBase(str) {
  return str;
  // add TOC
  //return str.replace(/^#\s([^\n]*)/m, '# $1\n\n[[toc]]\n');
}

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
      const target = `${config.root}/docs/api/services/${service}`;
      if (!fs.existsSync(target)) fs.mkdirSync(target, { recursive: true });
      fs.writeFileSync(`${target}/index.md`, content.length ? content : '```\n// TODO\n```');
    }
  },
};
