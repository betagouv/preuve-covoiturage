export type UsersInterface = {
  meta: {
    page: number;
    total: number;
    totalPages: number;
  };
  data: {
    id: number;
    firstname?: string;
    lastname?: string;
    email: string;
    operator_id?: number;
    territory_id?: number;
    phone?: string;
    role: string;
  }[];
};

export type TerritoriesInterface = {
  meta: {
    page: number;
    total: number;
    totalPages: number;
  };
  data: {
    id: number;
    name: string;
    level?: string;
  }[];
};

export type OperatorsInterface = {
  meta: {
    page: number;
    total: number;
    totalPages: number;
  };
  data: {
    id: number;
    name: string;
  }[];
};
