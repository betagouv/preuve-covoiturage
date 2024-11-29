'use client';
import crypto from 'crypto';
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface AuthContextProps {
  isAuth: boolean;
  state?: string,
  nonce?: string,
  token?: string;
  user: {name: string, role: string};
  login: () => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({children}: { children: React.ReactNode}) {
  
  const initOnce = useRef(false);
  const [isAuth, SetIsAuth] = useState(false);
  const [state, SetState] = useState<string>();
  const [nonce, SetNonce] = useState<string>();
  const [token, SetToken] = useState<string>();
  const [user, SetUser] = useState({
    name: '',
    role: ''
  })
  const login = () => {
    return '';
  };
  const logout = () => {
    return '';
  };

  const generateNonce = () => {
    return crypto.randomBytes(16).toString('hex');
  }

  useEffect(() => {
    const init = async () => {
      try {
        if (!initOnce.current) {
          initOnce.current = true;
          const initialized = true;
          if (initialized) {
            SetIsAuth(true)
            SetState(generateNonce())
            SetNonce(generateNonce())
            SetToken('abcdef')
            SetUser({name:'Ludo', role:'admin'})
          }
        }
      } catch (e) {
        console.error("Initialization failed", e);
        throw e;
      }
    };
    init();
  }, []);

  return(
    <AuthContext.Provider value={{isAuth, state, nonce, token, user, login, logout}}>
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