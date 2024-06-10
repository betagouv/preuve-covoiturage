import { _, NextFunction, Request, Response, Router } from "@/deps.ts";
import { KernelInterface } from "@/ilos/common/index.ts";
import { mapStatusCode } from "@/ilos/transport-http/index.ts";

import { createRPCPayload } from "./createRPCPayload.ts";

export type MapRequestType = (
  body: any,
  query?: any,
  params?: any,
  session?: any,
) => any;
export type MapResponseType = (result: any, error: any, session?: any) => any;

const defaultMapResponse: MapResponseType = (result, error) => {
  if (error) {
    return error;
  }
  return result;
};

// const defaultMapRequest: MapRequestType = (body: any, query?: any, params?: any, session?: any) => body;
const defaultMapRequest: MapRequestType = (body: any) => body;

const autoMapRequest: MapRequestType = (
  body: any,
  query?: any,
  params?: any,
) => ({
  ...query,
  ...params,
  ...body,
});

export type ObjectRouteMapType = {
  route: string;
  verb: string;
  signature: string;
  mapRequest?: MapRequestType | "auto";
  mapResponse?: MapResponseType;
};

export type ArrayRouteMapType = [
  string, // verb
  string, // route
  string, // signature
  (MapRequestType | "auto")?, // mapRequest
  MapResponseType?, // mapResponse
];

export type RouteHandlerType = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export function routeMapping(
  definitions: (ObjectRouteMapType | ArrayRouteMapType)[],
  router: Router,
  kernel: KernelInterface,
): void {
  const routes: Map<string, Map<string, ObjectRouteMapType>> = new Map();

  // normalize configured routes to routeMap to support
  // object or array configuration or the routes
  definitions.forEach((def) => {
    let normalizedDefinition: ObjectRouteMapType;
    if (Array.isArray(def)) {
      const [verb, route, signature, mapRequest, mapResponse] = def;
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
        const { mapRequest, mapResponse } = serviceDefinition;

        let mapRequestFinal: MapRequestType;
        let mapResponseFinal: MapResponseType;

        if (!mapRequest) {
          mapRequestFinal = defaultMapRequest;
        }

        if (typeof mapRequest !== "function") {
          mapRequestFinal = autoMapRequest;
        } else {
          mapRequestFinal = mapRequest;
        }

        if (!mapResponse) {
          mapResponseFinal = defaultMapResponse;
        } else {
          mapResponseFinal = mapResponse;
        }

        router[verb](
          route,
          async (
            req: Request,
            res: Response,
            next: NextFunction,
          ): Promise<void> => {
            try {
              const response = await kernel.handle(
                createRPCPayload(
                  serviceDefinition.signature,
                  mapRequestFinal(req.body, req.query, req.params, req.session),
                  _.get(req, "session.user", {}),
                ),
              );
              if (!response) {
                res.status(204).end();
              } else {
                if ("result" in response) {
                  res.json(
                    mapResponseFinal(
                      response.result,
                      response.error,
                      req.session,
                    ),
                  );
                }
                if ("error" in response) {
                  res
                    .status(mapStatusCode(response))
                    .json(
                      mapResponseFinal(
                        response.result,
                        response.error,
                        req.session,
                      ),
                    );
                }
              }
            } catch (e) {
              res.status(500).json({ error: e.message });
            }
          },
        );
      }
    });
  });
}
