import { check } from 'k6';
import http from 'k6/http';
import { globalOptions } from './acquisition_create.js';

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise,eqeqeq
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateRandomString(length) {
  let result = '';
  const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function createPayload(options, version) {
  const start = new Date().getTime() - parseInt(Math.random() * 5 * 86400000, 10);
  const end = start + parseInt(Math.random() * 1 * 3600000, 10);
  switch (version) {
    case 3:
      return [
        `${globalOptions.base_url}/v3/journeys`,
        JSON.stringify({
          operator_class: 'B',
          operator_journey_id: uuid(),
          operator_trip_id: uuid(),
          start: {
            datetime: new Date(start).toISOString(),
            lat: 49.45218,
            lon: 6.02627,
          },
          end: {
            datetime: new Date(end).toISOString(),
            lat: 49.45218,
            lon: 6.02627,
          },
          distance: 34039,
          incentives: [{ index: 0, amount: 280, siret: '28750007800020' }],
          incentive_counterparts: [{ target: 'passenger', amount: 280, siret: '28750007800020' }],

          passenger: {
            contribution: 76,
            seats: 1,
            identity: {
              operator_user_id: __ENV.LOAD_PASSENGER_ID || uuid(),
              identity_key: generateRandomString(64),
            },
          },

          driver: {
            revenue: 376,
            identity: {
              over_18: true,
              operator_user_id: __ENV.LOAD_DRIVER_ID || uuid(),
              identity_key: generateRandomString(64),
            },
          },
        }),
      ];
  }
}

export function connectAsOperator() {
  // store shared data
  const store = {};

  // connect as operator
  const response_login = http.post(
    `${globalOptions.base_url}/login`,
    JSON.stringify({
      email: globalOptions.user.email,
      password: globalOptions.user.password,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: {
        name: 'login',
      },
    },
  );

  check(response_login, {
    'is status 200': (r) => r.status === 200,
    'store user object': (r) => {
      const body = r.json();
      const hasData = body && body.result && body.result.data;
      store.user = hasData ? body.result.data : null;
      return hasData;
    },
  });

  console.info('[setup] Connected as operator admin');

  // create application and store token
  const response_application = http.post(
    `${globalOptions.base_url}/applications`,
    JSON.stringify({ name: 'Load testing' }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: {
        name: 'application',
      },
    },
  );

  check(response_application, {
    'is status 201': (r) => r.status === 201,
    'store application object and token': (r) => {
      const body = r.json();
      store.application = body.application;
      store.token = body.token;
      return true;
    },
  });

  console.info('[setup] Application created');

  return store;
}
