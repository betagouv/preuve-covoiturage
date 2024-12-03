'use client';
import crypto from 'crypto';
import { createContext, useContext, useState } from "react";
import { Config } from '../config';

interface AuthContextProps {
  isAuth: boolean;
  state?: string,
  nonce?: string,
  code?: string,
  iss?: string,
  user: {name: string, role: string},
  getCode: (stateValue: string | null, codeValue: string | null, issValue: string | null) => void,
  login: () => void,
  logout: () => void,
}
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({children}: { children: React.ReactNode}) {
  
  const [isAuth, SetIsAuth] = useState(false);
  const [state, SetState] = useState<string>();
  const [nonce, SetNonce] = useState<string>();
  const [code, SetCode] = useState<string>();
  const [user, SetUser] = useState({
    name: '',
    role: ''
  })

  const getCode = (stateValue: string | null, codeValue: string | null, issValue: string | null) => {
    try {
      console.debug(state)
      console.debug(stateValue)
      if(stateValue === state && issValue === `${Config.get('auth.domain')}/api/v2`) {
        console.debug('toto')
        SetCode(codeValue ?? undefined);
      }
    } catch (e) {
      console.error("Code validation failed", e);
      throw e;
    }
  };
  const login = () => {
    return '';
  };
  const logout = () => {
    return '';
  };

  const generateString = () => {
    return crypto.randomBytes(16).toString('hex');
  }

  return(
    <AuthContext.Provider value={{isAuth, state, nonce, code, getCode, user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};