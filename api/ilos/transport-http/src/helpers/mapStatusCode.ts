import { RPCResponseType, RPCSingleResponseType } from '@ilos/common';

// https://www.jsonrpc.org/historical/json-rpc-over-http.html#response-codes
export function mapStatusCode(results: RPCResponseType): number {
  // Notifications have no results and must return a 204 No Content
  if (!results) {
    return 204;
  }

  // BATCH requests
  if (Array.isArray(results)) {
    if (results.length === 1) {
      // tslint:disable-next-line: no-parameter-reassignment
      results = results[0] as RPCSingleResponseType;
    } else {
      // TODO - spec is not very clear here
      return 200;
    }
  }

  // ONE SHOT requests
  // 422 -32700            Parse error.
  // 400 -32600            Invalid Request.
  // 404 -32601            Method not found.
  // 400 -32602            Invalid params.
  // 500 -32603            Internal error.
  // 500 -32099...-32000   Server error.
  const { error } = results || { error: null };
  if (error) {
    switch (error.code) {
      // Bad Request
      case -32600:
      case -32602:
        return 400;

      // Unauthorized
      case -32501:
        return 401;

      // Forbidden
      case -32503:
        return 403;

      // Not Found (ressource)
      case -32504:
        return 404;

      // Method Not found
      case -32601:
        return 405;

      // Conflict
      case -32509:
        return 409;

      // Parse error --> Unprocessable entity
      case -32700:
        return 422;

      // Server Error
      default:
        return 500;
    }
  }

  // OK
  return 200;
}
