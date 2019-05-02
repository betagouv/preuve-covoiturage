const assert = require('assert');
const urlFactory = require('./url');

describe('url: both', async () => {
  const app = 'https://pdc-dashboard-dev.scalingo.io';
  const api = 'https://pdc-api-dev.scalingo.io';
  const { appUrl, apiUrl } = urlFactory(app, api);

  it('ok appUrl', () => {
    assert.equal(app, appUrl());
  });

  it('ok apiUrl', () => {
    assert.equal(api, apiUrl());
  });

  it('ok /', () => {
    assert.equal(api, apiUrl('/'));
    assert.equal(app, appUrl('/'));
  });

  it('ok /with-slug', () => {
    const slug = '/with-slug';
    assert.equal(`${api}${slug}`, apiUrl(slug));
    assert.equal(`${app}${slug}`, appUrl(slug));
  });

  it("ok /j'ai des caractères bizarres!!! ~`0)4r€", () => {
    const slug = "/j'ai des caractères bizarres!!! ~`0)4r€";
    const cleanSlug = "/j'ai%20des%20caract%C3%A8res%20bizarres!!!%20~%600)4r%E2%82%AC";
    assert.equal(`${api}${cleanSlug}`, apiUrl(slug));
    assert.equal(`${app}${cleanSlug}`, appUrl(slug));
  });

  it('ok love HTML', () => {
    const slug = "/<script src='tryit.js'>alert(tryit());</script>";
    const cleanSlug = "/%3Cscript%20src='tryit.js'%3Ealert(tryit());%3C/script%3E";
    assert.equal(`${api}${cleanSlug}`, apiUrl(slug));
    assert.equal(`${app}${cleanSlug}`, appUrl(slug));
  });
});

describe('url: dev APP_URL only', async () => {
  const app = 'https://pdc-dashboard-dev.scalingo.io';
  const api = 'https://pdc-api-dev.scalingo.io';
  const { appUrl, apiUrl } = urlFactory(app, null);

  it('ok appUrl', () => {
    assert.equal(app, appUrl());
  });

  it('ok apiUrl', () => {
    assert.equal(api, apiUrl());
  });
});

describe('url: dev API_URL only', async () => {
  const app = 'https://pdc-dashboard-dev.scalingo.io';
  const api = 'https://pdc-api-dev.scalingo.io';
  const { appUrl, apiUrl } = urlFactory(null, api);

  it('ok appUrl', () => {
    assert.equal(app, appUrl());
  });

  it('ok apiUrl', () => {
    assert.equal(api, apiUrl());
  });
});

describe('url: PR APP_URL only', async () => {
  const app = 'https://pdc-dashboard-dev-pr147.scalingo.io';
  const api = 'https://pdc-api-dev-pr147.scalingo.io';
  const { appUrl, apiUrl } = urlFactory(app, null);

  it('ok appUrl', () => {
    assert.equal(app, appUrl());
  });

  it('ok apiUrl', () => {
    assert.equal(api, apiUrl());
  });
});

describe('url: PR API_URL only', async () => {
  const app = 'https://pdc-dashboard-dev-pr147.scalingo.io';
  const api = 'https://pdc-api-dev-pr147.scalingo.io';
  const { appUrl, apiUrl } = urlFactory(null, api);

  it('ok appUrl', () => {
    assert.equal(app, appUrl());
  });

  it('ok apiUrl', () => {
    assert.equal(api, apiUrl());
  });
});
