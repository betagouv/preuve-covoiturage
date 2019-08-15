export interface StatInterface {
  carpoolers: {
    total: number;
    days: StatDateTotal[];
    months: StatDateTotal[];
  };
  carpoolers_per_vehicule: {
    total: number;
    days: StatDateTotal[];
  };
  distance: {
    total: number;
    days: StatDateTotal[];
    months: StatDateTotal[];
  };
  operators: {
    total: number;
    imgIds: [];
  };
  trips: {
    total: number;
    total_subsidized: number;
    days: {
      date: string;
      total: number;
      total_subsidized: number;
    }[];
    months: {
      date: string;
      total: number;
      total_subsidized: number;
    }[];
  };
}

export interface StatDateTotal {
  date: string;
  total: number;
}
