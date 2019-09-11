import { ObjectRouteMapType, ArrayRouteMapType } from '../helpers/routeMapping';

/**
 * Route format
 * [verb, route, signature, mapRequest, mapResponse]
 *
 * - verb:        get | post | put | patch | delete
 * - route:       /abc/:prop
 * - signature:   service:action
 * - mapRequest:  (body: any, query?: any, params?: any, session?: any) => any
 * - mapResponse: (result: any, error: any, session?: any) => any
 */

export const routeMap: (ObjectRouteMapType | ArrayRouteMapType)[] = [
  // PROFILE
  // ['get', '/profile', 'user:find', (body, _query, _params, session) => ({ ...body, _id: session.user._id })],
  // ['put', '/profile', 'user:patch', (body, _query, _params, session) => ({ ...body, _id: session.user._id })],
  // ['delete', '/profile', 'user:delete', (_body, _query, _params, session) => ({ _id: session.user._id })],
  // [
  //   'post',
  //   '/profile/password',
  //   'user:changePassword',
  //   (body, _query, _params, session) => ({ ...body, _id: session.user._id }),
  // ],

  // AUTHENTICATION
  // ['post', '/forgotten', 'user:forgottenPassword', 'auto'],
  // ['post', '/reset', 'user:resetPassword', 'auto'],

  // USERS
  // ['post', '/users/invite', 'user:create', 'auto'],
  // ['get', '/users/:_id', 'user:find', 'auto'],
  // ['put', '/users/:_id', 'user:patch', 'auto'],
  // ['delete', '/users/:_id', 'user:delete', 'auto'],
  // ['get', '/users', 'user:list', 'auto'],

  // add users to a territory
  // ['post', '/territories/:territory/users/add', 'user:create', 'auto'],
  // ['post', '/territories/:territory/users/remove', 'user:delete', 'auto'],
  // ['get', '/territories/:territory/users', 'user:list', 'auto'],

  // add users to an operator
  // ['post', '/operators/:operator/users/add', 'user:create', 'auto'],
  // ['post', '/operators/:operator/users/remove', 'user:delete', 'auto'],
  // ['get', '/operators/:operator/users', 'user:list', 'auto'],

  // OPERATORS
  // ['get', '/operators/:_id', 'operator:find' > doest not exists],
  // ['put', '/operators/:_id', 'operator:patch', 'auto'],
  // ['delete', '/operators/:_id', 'operator:delete', 'auto'],
  // ['get', '/operators', 'operator:all'],
  // ['post', '/operators', 'operator:create'],

  // Operator applications
  // ['get', '/operators/:operator_id/applications', 'application:all', 'auto'],
  // ['get', '/operators/:operator_id/applications/:_id', 'application:find', 'auto'],
  // ['post', '/operators/:operator_id/applications', 'application:create', 'auto'],
  // ['delete', '/operators/:operator_id/applications/:_id', 'application:revoke', 'auto'],

  // TERRITORIES
  // ['put', '/territories/:_id', 'territory:patch', 'auto'],
  // ['delete', '/territories/:_id', 'territory:delete', 'auto'],
  // ['get', '/territories', 'territory:all'],
  // ['post', '/territories', 'territory:create'],

  // JOURNEYS
  // ['put', '/journeys/:_id', 'journey:patch', 'auto'],
  // ['delete', '/journeys/:_id', 'journey:delete', 'auto'],
  // ['get', '/journeys', 'journey:all'],
  // ['post', '/journeys', 'journey:create'],
  ['post', '/journeys/push', 'acquisition:create'], // server push
];
