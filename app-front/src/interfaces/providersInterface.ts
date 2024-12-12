export interface AuthContextProps {
  isAuth: boolean;
  state?: string;
  setState: (newState: string | undefined) => void;
  nonce?: string;
  setNonce: (newNonce: string | undefined) => void;
  code?: string;
  iss?: string;
  user?: { name: string; role: string; territory_id?: string };
  getCode: (stateValue: string | null, codeValue: string | null, issValue: string | null) => void;
}
