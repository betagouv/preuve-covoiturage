const fs = require('fs');
const { exec } = require('child_process');

module.exports = {
  genApiLicenses(config) {
    exec('yarn -s licenses list --json', (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }

      const { data } = JSON.parse(stdout.replace(/^\{"type":"progress.*\n/gm, '').replace(/^\{"type":"info.*\n/gm, ''));

      // write header
      let md = '| Library | Licence | Author |\n';
      md += '| --- | --- | --- |\n';

      // add body
      for (const line of data.body) {
        md += `| [${line[0]}](${line[3]}) (${line[1]}) | ${line[2]} | ${
          line[4] === 'Unknown' ? line[5] : `[${line[5]}](${line[4]})`
        } |\n`;
      }

      fs.writeFileSync(
        `${config.root}/docs/api/licenses-list.md`,
        `# Licences

Liste des licences des dépendances utilisées dans l'API.

${md}
`,
      );
    });
  },
};
