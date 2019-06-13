import { describe } from 'mocha';
import axios from 'axios';
import chai from 'chai';
import nock from 'nock';
import chaiNock from 'chai-nock';
import { bootstrap } from '@ilos/framework';

chai.use(chaiNock);

const { expect } = chai;
const port = '8081';

let transport;
let request;
let nockRequest;

describe('Notification service', async () => {
  before(async () => {
    transport = await bootstrap.boot(['', '', 'http', port]);
    // request = supertest(transport.server);
    request = axios.create({
      baseURL: `http://127.0.0.1:${port}`,
      timeout: 1000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  });

  after(async () => {
    await transport.down();
  });

  beforeEach(() => {
    const url = 'https://api.mailjet.com';
    const endpoint = '/v3.1/send';
    nockRequest = nock(/mailjet/)
      .post(/.*/)
      .reply(200, {
        Messages: [],
      });
  });
  afterEach(() => {
    nock.cleanAll();
  });

  it('works', async () => {
    const response = await request.post('/', {
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
    expect(response.status).equal(200);
  });

  it('send correct request to mailjet', () => {
    request.post('/', {
      id: 1,
      jsonrpc: '2.0',
      method: 'notification:sendmail',
      params: {
        email: 'test@fake.com',
        fullname: 'Mad tester',
        subject: 'Mot de passe oublié',
        content: 'Hello world',
      },
    });

    return (<any>expect(nockRequest).to.have.been).requestedWith({
      Messages: [
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
            title: 'Mot de passe oublié',
            content: 'Hello world',
          },
        },
      ],
    });
  });
});
