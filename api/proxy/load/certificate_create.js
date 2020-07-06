/**
 * Load test certificate creation and print
 */

import http from 'k6/http';
import { check } from 'k6';

// global options
const o = {
  sleep_duration: 1,
  base_url: __ENV.LOAD_BASE_URL || 'http://localhost:8080',
  user: {
    email: 'maxicovoit.admin@example.com',
    password: 'admin1234',
  },
};

// k6 options
export let options = {
  vus: 10,
  duration: '10s',
  throw: true,
};

export function setup() {
  // store shared data
  const store = {};

  // connect as operator
  const response_login = http.post(
    `${o.base_url}/login`,
    JSON.stringify({
      email: o.user.email,
      password: o.user.password,
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
  const response_application = http.post(`${o.base_url}/applications`, JSON.stringify({ name: 'Load testing' }), {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: {
      name: 'application',
    },
  });

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

export default function(store) {
  // create a certificate
  const response_cert = http.post(
    `${o.base_url}/v2/certificates`,
    JSON.stringify({
      tz: 'Europe/Paris',
      identity: {
        phone: __ENV.LOAD_PHONE || '+33612345670',
      },
      positions: [
        {
          lat: 47.19901,
          lon: -1.5853,
        },
        {
          lat: 47.21901,
          lon: -1.5253,
        },
      ],
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${store.token}`,
      },
      tags: {
        name: 'certificate_create',
      },
    },
  );

  check(response_cert, {
    'is status 201': (r) => r.status === 201,
    'has body': (r) => {
      const body = r.json();
      return body && body.uuid && body.created_at;
    },
  });
}
