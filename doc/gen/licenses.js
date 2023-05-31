/* eslint-disable @typescript-eslint/no-var-requires,max-len */
const fs = require('fs');
const { exec } = require('child_process');

module.exports = {
  genApiLicenses(config) {
    /** BROKEN : TO FIX WITH NPM
    exec('yarn -s licenses list --json', (error, stdout, stderr) => {
      if (error) {
        console.debug(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.debug(`stderr: ${stderr}`);
        return;
      }

      const { data } = JSON.parse(stdout.replace(/^\{"type":"progress.*\n/gm, '').replace(/^\{"type":"info.*\n/gm, ''));

      // write header
      let md = '| Library | Licence | Author |\n';
      md += '| --- | --- | --- |\n';

      // add body
      for (const line of data.body) {
        // eslint-disable-next-line prettier/prettier
        md += `| [${line[0]}](${line[3]}) (${line[1]}) | ${line[2]} | ${line[4] === 'Unknown' ? line[5] : `[${line[5]}](${line[4]})`} |\n`;
      }

      fs.writeFileSync(
        `${config.root}/docs/contribuer/api/licenses-list.md`,
        `# Licences

Liste des licences des dépendances utilisées dans l'API.

${md}
`,
      );
    });
    */
  },
};
