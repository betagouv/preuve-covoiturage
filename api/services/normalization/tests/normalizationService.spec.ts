import chai from 'chai';
import nock from 'nock';
import * as _ from 'lodash';

import { MockFactory } from './mocks/normalizationMockFactory';
import { journey } from './mocks/journey';
import { positionPaths } from '../src/config/normalization';
import { Transport } from './transport/transport';

const mockFactory = new MockFactory();

const journeyMarseilleLyon = { ...journey };

positionPaths.map((path:string) => {
  _.set(journeyMarseilleLyon, `${path}lon`, 5.3682);
  _.set(journeyMarseilleLyon, `${path}lat`, 43.2392);
});

const request = mockFactory.request();
const transport = new Transport();

let nockRequest;

before(() => {
  transport.start();
  nock.recorder.rec();
});

after(() => {
  transport.stop();
});

beforeEach(() => {
  nockRequest = nock(/http/)
    .post('/')
    .reply(200);
});

afterEach(() => {
  nock.cleanAll();
});

describe('SERVICE NORMALIZATION - normalize geo', () => {
  before(async () => {

  });
  it('marseille - lyon : should enrich postion of passenger & driver', async () => {
    nockRequest.on('request', (req, interceptor, body) => {
      console.log(req);
    });

    const { status: createStatus, data: createData } = await request.post(
      '/',
      mockFactory.call(
        'normalization:geo',
        {
          journey: journeyMarseilleLyon,
        },
      ),
    );
  });
});
