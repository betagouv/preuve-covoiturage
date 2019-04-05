const mung = require('express-mung');

// eslint-disable-next-line no-unused-vars
const dataWrap = (body, req, res) => {
  if (body && body.data && body.meta) {
    return body;
  }

  return {
    meta: null,
    data: body,
  };
};

module.exports = mung.json(dataWrap);
