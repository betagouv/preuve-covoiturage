'use client';
import Keycloak from 'keycloak-js';
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Config } from '../config';

export const kc = new Keycloak({
  url: Config.get<string>("auth.keycloak_url"),
  realm: Config.get<string>("auth.keycloak_realm"),
  clientId: Config.get<string>("auth.keycloak_id"),
});

interface AuthContextProps {
  isAuth: boolean;
  token?: string;
  user: {name: string, role: string};
  login: () => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({children}: { children: React.ReactNode}) {
  
  const initOnce = useRef(false);
  const [isAuth, SetIsAuth] = useState(false);
  const [token, SetToken] = useState<string>();
  const [user, SetUser] = useState({
    name: '',
    role: ''
  })
  const login = () => {
    return kc.login();
  };
  const logout = () => {
    return kc.logout();
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (!initOnce.current) {
          initOnce.current = true;
          const initialized = await kc.init({ onLoad: "check-sso" });
          if (initialized) {
            SetIsAuth(kc.authenticated ?? false);
            SetToken(kc.token);
            SetUser({
              name:kc.tokenParsed?.name,
              role:kc.tokenParsed?.role,
            });
          }
          // Configure le renouvellement automatique du token
          kc.onTokenExpired = async () => {
            try {
              const refreshed = await kc.updateToken(30); // Renouvelle si le token expire dans moins de 30s
              if (refreshed) SetToken(kc.token);
            } catch (e) {
              console.error("Failed to refresh the token", e);
              kc.logout();
              throw e;
            }
          };
        }
      } catch (e) {
        console.error("Keycloak initialization failed", e);
        throw e;
      }
    };
    init();
  }, []);

  return(
    <AuthContext.Provider value={{isAuth, token, user, login, logout}}>
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