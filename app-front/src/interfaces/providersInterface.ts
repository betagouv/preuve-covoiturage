import { type enumRoles } from "../helpers/auth";

export interface AuthContextProps {
  isAuth: boolean;
  setIsAuth: (newIsAuth: boolean) => void;
  user?: {
    email: string;
    name?: string;
    role: (typeof enumRoles)[number];
    permissions: Array<string>;
    operator_id?: number;
    territory_id?: number;
    siret?: string;
  };
  simulatedRole: boolean;
  onChangeTerritory: (id?: number) => void;
  onChangeOperator: (id?: number) => void;
  onChangeSimulatedRole: () => void;
  logout: () => Promise<void>;
}
