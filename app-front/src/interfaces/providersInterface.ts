export interface AuthContextProps {
  isAuth: boolean;
  setIsAuth: (newIsAuth: boolean) => void;
  user?: {
    email: string;
    role: string;
    permissions: Array<string>;
    operator_id: number | null;
    territory_id: number | null;
    siret: string | null;
  };
  onChangeTerritory: (id: number) => void;
  onChangeOperator: (id: number) => void;
}
