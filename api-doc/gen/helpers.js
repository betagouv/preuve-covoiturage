module.exports = {
  getTopComment(str) {
    if (typeof str !== 'string') return '';
    const firstImport = str.indexOf('import {');
    const pos = str.indexOf('*/');
    if (pos === -1 || firstImport < pos) return '';
    return str
      .substr(0, pos)
      .replace(/^ ?\* ?/gm, '')
      .replace('/**', '')
      .trim();
  },

  printBase(str) {
    return str;
    // add TOC
    //return str.replace(/^#\s([^\n]*)/m, '# $1\n\n[[toc]]\n');
  },
};
