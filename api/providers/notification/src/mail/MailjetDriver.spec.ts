import { describe } from 'mocha';
import chai from 'chai';
import nock from 'nock';
import chaiNock from 'chai-nock';

import { ConfigInterfaceResolver, TemplateInterfaceResolver } from '@ilos/common';

import { Notification } from '../Notification';

chai.use(chaiNock);
const { expect } = chai;

class FakeTemplate extends TemplateInterfaceResolver {
  getMetadata(key: string) {
    return {
      subject: 'Mot de passe oublié',
    };
  }
  get(key: string, opts: any) {
    return `Bonjour ${opts.fullname}, voici le lien ${opts.link}`;
  }
}

class FakeConfig extends ConfigInterfaceResolver {
  get(key: string, fallback?: any) {
    return {
      mail: {
        debug: false,
        driver: 'mailjet',
        driverOptions: {},
        sendOptions: {
          template: 123456,
        },
        from: {
          name: 'From Example',
          email: 'from@example.com',
        },
        defaultSubject: 'Preuve de covoiturage',
        to: {
          name: 'Mad tester',
          email: 'test@fake.com',
        },
      },
    };
  }
}
const provider = new Notification(new FakeConfig(), new FakeTemplate());
let nockRequest;
const url: RegExp = /mailjet/;
const endpoint: RegExp = /send/;

describe('Notification service', async () => {
  before(async () => {
    await provider.init();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('send correct request to mailjet', (done) => {
    let body;
    nockRequest = nock(url)
      .post(endpoint, (b) => {
        body = b;
        return b;
      })
      .reply(200, {
        Messages: [],
      })
      .on('replied', (req) => {
        expect(body).to.deep.equal({
          Messages: [
            {
              From: {
                Email: 'from@example.com',
                Name: 'From Example',
              },
              To: [
                {
                  Email: 'test@fake.com',
                  Name: 'Mad tester',
                },
              ],
              TemplateID: 123456,
              TemplateLanguage: true,
              Subject: 'Mot de passe oublié',
              Variables: {
                title: 'Mot de passe oublié',
                content: 'Hello world !!!',
              },
            },
          ],
        });
        done();
      });

    provider.sendByEmail({
      email: 'test@fake.com',
      fullname: 'Mad tester',
      subject: 'Mot de passe oublié',
      content: 'Hello world !!!',
    });
  });

  it('send correct request to mailjet with template', (done) => {
    let body;
    nockRequest = nock(url)
      .post(endpoint, (b) => {
        body = b;
        return b;
      })
      .reply(200, {
        Messages: [],
      })
      .on('replied', (req) => {
        expect(body).to.deep.equal({
          Messages: [
            {
              From: {
                Email: 'from@example.com',
                Name: 'From Example',
              },
              To: [
                {
                  Email: 'test@fake.com',
                  Name: 'Mad tester',
                },
              ],
              TemplateID: 123456,
              TemplateLanguage: true,
              Subject: 'Mot de passe oublié',
              Variables: {
                title: 'Mot de passe oublié',
                content: 'Bonjour Mad tester, voici le lien http://givememoney',
              },
            },
          ],
        });
        done();
      });

    provider.sendTemplateByEmail({
      email: 'test@fake.com',
      fullname: 'Mad tester',
      template: 'forgotten_password',
      opts: {
        link: 'http://givememoney',
      },
    });
  });
});
