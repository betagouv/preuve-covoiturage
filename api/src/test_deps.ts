import sinon, { SinonStub, SinonSandbox, stub } from 'npm:sinon@^18';
// @deno-types="npm:@types/supertest@^6"
import supertest from 'npm:supertest@^7';
// @deno-types="npm:@types/supertest@^6"
export type { Agent as SuperTestAgent } from 'npm:supertest@^7';

import nock from 'npm:nock@^13.5';
export { sinon, nock, supertest, stub };
export type { SinonStub, SinonSandbox };
export {
  assertEquals,
  assertStrictEquals,
  assertThrows,
  assertRejects,
  assertObjectMatch,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
export {
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.224.0/testing/bdd.ts";
// @deno-types="npm:@types/node@^20"
export type { Context } from 'node:vm';