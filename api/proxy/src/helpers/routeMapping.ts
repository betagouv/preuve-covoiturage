import express from 'express';
import { Interfaces, Types } from '@pdc/core';

export type MapRequestType = (body: any, query?: any, params?: any) => any;
export type MapResponseType = (result: any, error: any) => any;

const defaultMapResponse: MapResponseType = (result, error) => {
  if (error) {
    return error;
  }
  return result;
}

const defaultMapRequest: MapRequestType = (body: any, query?: any, params?: any) => body;

export type ObjectRouteMapType = {
  route: string,
  verb: string,
  signature: string,
  mapRequest?: MapRequestType,
  mapResponse?: MapResponseType,
};

export type ArrayRouteMapType = [
  string, // verb
  string, // route
  string, // signature
  MapRequestType?, // mapRequest
  MapResponseType?, // mapResponse
];

export type RouteHandlerType = (req: express.Request, res: express.Response, next:express.NextFunction) => Promise<void>;

export function routeMapping(definitions: Array<ObjectRouteMapType | ArrayRouteMapType>, router: express.Router, kernel: Interfaces.KernelInterface): void {
  const routes: Map<string, Map<string, ObjectRouteMapType>> = new Map();

  definitions.forEach(def => {
    let normalizedDefinition: ObjectRouteMapType;
    if (Array.isArray(def)) {
      const [ verb, route, signature, mapRequest, mapResponse] = def;
      normalizedDefinition = {
        verb,
        route,
        signature,
        mapRequest,
        mapResponse,
      };
    } else {
      normalizedDefinition = { ...def };
    }
    if (!routes.has(normalizedDefinition.route)) {
      routes.set(normalizedDefinition.route, new Map());
    }
    const routeMap = routes.get(normalizedDefinition.route);
    routeMap.set(normalizedDefinition.verb.toLowerCase(), normalizedDefinition);
  });
  routes.forEach((verbMap, route) => {
    verbMap.forEach((serviceDefinition, verb) => {
      if (verb in router) {
        const baseRPCCall = {
          jsonrpc: '2.0',
          id: 1,
          method: serviceDefinition.signature,
        };

        let { mapRequest, mapResponse } = serviceDefinition;

        if (!mapRequest) {
          mapRequest = defaultMapRequest;
        }

        if (!mapResponse) {
          mapResponse = defaultMapResponse;
        }
        router[verb](route, async (req: express.Request, res: express.Response, next:express.NextFunction): Promise<void> => {
          const response = await kernel.handle({
            ...baseRPCCall,
            params: {
              params: mapRequest(req.body, req.query, req.params),
              _context: {
                channel: {
                  service: 'proxy',
                  transport: 'http',
                },
                call: {
                  user: req.user,
                },
              },
            },
          });

          if (response && 'result' in response) {
            res.json(mapResponse(response.result, response.error));
          }
        });
      }
    })
  });
};
