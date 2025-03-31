export interface AuthContextProps {
  isAuth: boolean;
  setIsAuth: (newIsAuth: boolean) => void;
  user?: {
    email: string;
    role: string;
    permissions: Array<string>;
    operator_id?: number;
    territory_id?: number;
    siret?: string;
  };
  onChangeTerritory: (id?: number) => void;
  onChangeOperator: (id?: number) => void;
}
