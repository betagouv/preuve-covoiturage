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
    email: 'operator@example.com',
    // email: 'maxicovoit.admin@example.com',
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

export default function (store) {
  const start = new Date().getTime() - Math.random() * 10000000000;
  const end = start + Math.random() * 1000000;

  // create a journey
  const response_acq = http.post(
    `${o.base_url}/v2/journeys`,
    JSON.stringify({
      operator_class: 'B',
      journey_id: `dfd2ae54-${(parseInt(Math.random() * 10000, 10) + 10000).toString(16).substr(0, 4)}-${(
        parseInt(Math.random() * 10000, 10) + 10000
      )
        .toString(16)
        .substr(0, 4)}-${(parseInt(Math.random() * 10000, 10) + 10000).toString(16).substr(0, 4)}-1769ea7e6f78`,
      operator_journey_id: `a1c5848f-${(parseInt(Math.random() * 10000, 10) + 10000).toString(16).substr(0, 4)}-${(
        parseInt(Math.random() * 10000, 10) + 10000
      )
        .toString(16)
        .substr(0, 4)}-${(parseInt(Math.random() * 10000, 10) + 10000).toString(16).substr(0, 4)}-2256c3116b4c`,
      passenger: {
        distance: 34039,
        duration: 1485,
        incentives: [],
        contribution: 76,
        seats: 1,
        identity: {
          over_18: true,
          phone: __ENV.LOAD_PASSENGER_ID || `+3376755${parseInt(Math.random() * 9000, 10) + 1000}`,
        },
        start: {
          datetime: new Date(start).toISOString(),
          lat: 48.77826,
          lon: 2.21223,
        },
        end: {
          datetime: new Date(end).toISOString(),
          lat: 48.82338,
          lon: 1.78668,
        },
      },
      driver: {
        distance: 34039,
        duration: 1485,
        incentives: [],
        revenue: 376,
        identity: {
          over_18: true,
          phone: __ENV.LOAD_DRIVER_ID || `+3378388${parseInt(Math.random() * 9000, 10) + 1000}`,
        },
        start: {
          datetime: new Date(start).toISOString(),
          lat: 48.77826,
          lon: 2.21223,
        },
        end: {
          datetime: new Date(end).toISOString(),
          lat: 48.82338,
          lon: 1.78668,
        },
      },
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

  check(response_acq, {
    'is status 200': (r) => r.status === 200,
    'has body': (r) => {
      const body = r.json();
      const hasResult = body && body.result;
      if (hasResult) {
        return true;
      }
      console.log(JSON.stringify(body));
      return false;
    },
  });
}
