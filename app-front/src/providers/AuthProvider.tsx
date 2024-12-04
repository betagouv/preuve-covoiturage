'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { Config } from '../config';

interface AuthContextProps {
  isAuth: boolean;
  state?: string,
  setState:(newState: string | undefined) => void,
  nonce?: string,
  setNonce:(newNonce: string | undefined) => void,
  code?: string,
  iss?: string,
  user?: {name: string, role: string},
  getCode: (stateValue: string | null, codeValue: string | null, issValue: string | null) => void,
}
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({children}: { children: React.ReactNode}) {
  
  const [isAuth, setIsAuth] = useState(false);
  const [state, setState] = useState<string>();
  const [nonce, setNonce] = useState<string>();
  const [code, setCode] = useState<string>();
  

  const getCode = (stateValue: string | null, codeValue: string | null, issValue: string | null) => {
    try {
      if(stateValue === state && issValue === `${Config.get('auth.domain')}/api/v2`) {
        setCode(codeValue ?? undefined);
        setIsAuth(true);
      }
    } catch (e) {
      console.error("Code validation failed", e);
      throw e;
    }
  };

  useEffect(() => {
    const stateToken = sessionStorage.getItem('stateToken');
    const nonceToken = sessionStorage.getItem('nonceToken');
    if (stateToken && nonceToken) {
      setState(stateToken);
      setNonce(nonceToken);
    }
  }, []);

  

  return(
    <AuthContext.Provider value={{isAuth, state, setState, nonce, setNonce, code, getCode}}>
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