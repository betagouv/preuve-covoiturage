/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { cwd } = require('process');

const { existsSync, unlinkSync, copyFileSync, constants } = require('fs');

// https://github.com/amplia-iiot/vuepress-theme-openapi
function copyOpenApi(sourceName, targetName) {
  const sourcePath = path.resolve(cwd(), '../api/doc/', sourceName);
  const targetPath = path.resolve(cwd(), 'docs/.vuepress/public/specs', targetName);

  if (existsSync(targetPath)) unlinkSync(targetPath);
  if (existsSync(sourcePath)) {
    console.debug(`Copy OpenAPI file: ${sourcePath} -> ${targetPath}`);
    copyFileSync(sourcePath, targetPath, constants.COPYFILE_FICLONE);
  }
}

module.exports = { copyOpenApi };
