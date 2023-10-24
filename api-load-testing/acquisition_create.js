import { check } from 'k6';
import http from 'k6/http';
import { connectAsOperator, createPayload } from './helpers.js';

// global options
export const globalOptions = {
  sleep_duration: 1,
  base_url: __ENV.LOAD_BASE_URL || 'http://localhost:8080',
  user: {
    email: 'operator@example.com',
    password: 'admin1234',
  },
};

// k6 options
/**
 * Options for the acquisition create load test.
 * @typedef {Object} AcquisitionCreateOptions
 * @property {number} vus - The number of virtual users to simulate.
 * @property {string} duration - The duration of the test in seconds or as a time string (e.g. '10s').
 * @property {boolean} throw - Whether to throw an error if a request fails.
 * @property {boolean} insecureSkipTLSVerify - Whether to skip TLS certificate verification.
 */

/** @type {AcquisitionCreateOptions} */
export const options = {
  vus: 10,
  duration: '10s',
  throw: true,
  insecureSkipTLSVerify: true,
};

/**
 * The default function that is executed by k6 during the load test.
 * It creates a journey acquisition by sending a POST request to the API and checks the response.
 */
export default function () {
  const store = connectAsOperator();

  // create a journey
  const [url, payload] = createPayload(globalOptions, 3);
  const response_acq = http.post(url, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${store.token}`,
    },
    tags: {
      name: 'certificate_create',
    },
  });

  check(response_acq, {
    'is status 200': (r) => r.status === 200,
    'has body': (r) => {
      const body = r.json();
      const hasResult = body && body.result;
      if (hasResult) {
        return true;
      }
      console.error(JSON.stringify(body));
      return false;
    },
  });
}
