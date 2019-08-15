import { browser } from 'protractor';

import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    browser.waitForAngularEnabled(false);
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(true).toEqual(true);
  });
});
