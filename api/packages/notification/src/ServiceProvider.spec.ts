import { describe } from 'mocha';
import path from 'path';
import { Parents, Types } from '@pdc/core';
import chai from 'chai';
import nock from 'nock';
import chaiNock from 'chai-nock';

import { ServiceProvider } from './ServiceProvider';

chai.use(chaiNock);

process.env.APP_WORKING_PATH = path.resolve(process.cwd(), 'dist');
process.env.APP_ENV = 'testing';

const { expect } = chai;
class ServiceKernel extends Parents.Kernel {
  serviceProviders = [ServiceProvider];
}

const service = (<Types.Kernel>new ServiceKernel());
let nockRequest;

describe('Notification service', async () => {
  before(async () => {
    await service.boot();
  });

  beforeEach(() => {
    const url = 'https://api.mailjet.com';
    const endpoint = '/v3.1/send';
    nockRequest = nock(/mailjet/)
      .post(/.*/)
      .reply(
        200,
        {
          Messages: [],
        },
      )
      .log(console.log)
      .on('request', (_req, _int, body) => {
        console.log({ body });
      });
  });
  afterEach(() => {
    nock.cleanAll();
  });

  it('works', async () => {
    const response = await service.handle({
      id: 1,
      jsonrpc: '2.0',
      method: 'notification:sendmail',
      params: {
        email: 'test@fake.com',
        fullname: 'Mad tester',
        subject: 'Mot de passe oublié',
        content: 'Hello world !!!',
      },
    });
    expect(response).to.deep.equal({
      jsonrpc: '2.0',
      id: 1,
      result: undefined,
    });
  });

  it('send correct request to mailjet', () => {
    service.handle({
      id: 1,
      jsonrpc: '2.0',
      method: 'notification:sendmail',
      params: {
        email: 'test@fake.com',
        fullname: 'Mad tester',
        subject: 'Mot de passe oublié',
        content: 'Hello world !!!',
      },
    });

    return (<any>expect(nockRequest).to.have.been)
      .requestedWith({
        Messages:[
          {
            From: {
              Email: '',
              Name: '',
            },
            To: [
              {
                Email: 'test@fake.com',
                Name: 'Mad tester',
              },
            ],
            TemplateID: null,
            TemplateLanguage: true,
            Subject: 'Mot de passe oublié',
            Variables: {
              title:'Mot de passe oublié',
              content: 'Hello world',
            },
          },
        ],
      });
  });

  // it('works with template', async () => {
  //   const response = await request.post(
  //     '/',
  //     {
  //       id: 1,
  //       jsonrpc: '2.0',
  //       method: 'notification:sendtemplatemail',
  //       params: {
  //         email: 'test@fake.com',
  //         fullname: 'Mad tester',
  //         template: 'forgotten_password',
  //         opts: {
  //           link: 'http://givememoney',
  //         },
  //       },
  //     },
  //   );
  //   expect(response.status).equal(200);
  // });

  // it('send correct request to mailjet with template', () => {
  //   request.post('/',
  //     {
  //     id: 1,
  //     jsonrpc: '2.0',
  //     method: 'notification:sendtemplatemail',
  //     params: {
  //       email: 'test@fake.com',
  //       fullname: 'Mad tester',
  //       template: 'forgotten_password',
  //       opts: {
  //         link: 'http://givememoney',
  //       }
  //     }
  //   });

  //   return (<any>expect(nockRequest).to.have.been)
  //     .requestedWith({
  //       Messages:[
  //         {
  //           From: {
  //             Email: '',
  //             Name: '',
  //           },
  //           To: [
  //             {
  //               Email: 'test@fake.com',
  //               Name: 'Mad tester',
  //             }
  //           ],
  //           TemplateID: null,
  //           TemplateLanguage: true,
  //           Subject: 'Mot de passe oublié',
  //           Variables: {
  //             title:'Mot de passe oublié',
  //             content: `Bonjour Mad tester,<br>
  //             Vous avez demandé la réinitialisation de votre mot de passe sur le site du Registre de preuve de covoiturage.<br>
  //             <br>
  //             Veuillez cliquer sur le lien suivant et choisir un nouveau mot de passe.
  //             <br>
  //             <br>
  //             http://givememoney`,
  //           },
  //         },
  //       ],
  //     });
  // });
});
