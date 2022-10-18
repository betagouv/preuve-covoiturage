// shared

export interface RouteMeta {
  distance: number;
  duration: number;
}

// end of shared

export type RouteResultInterface = {
  calc_distance: number;
  calc_duration: number;
};

export interface RouteParamsInterface {
  start: {
    lat: number;
    lon: number;
  };
  end: {
    lat: number;
    lon: number;
  };
}

export interface RouteNormalizerProviderInterface {
  handle(params: RouteParamsInterface): Promise<RouteResultInterface>;
}
