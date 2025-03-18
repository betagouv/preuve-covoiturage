'use client'
import { AuthContextProps } from '@/interfaces/providersInterface';
import { createContext, useContext, useEffect, useState } from "react";
import { Config } from '../config';
 
const AuthContext = createContext<AuthContextProps | undefined>(undefined);
export function AuthProvider({children}: { children: React.ReactNode}) {
  
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<AuthContextProps["user"]>();
  
  const checkAuth = async () => {
    const response = await fetch(`${Config.get('auth.domain')}/auth/me`, { credentials: "include" });
    const data: AuthContextProps["user"] = await response.json();
    if (data?.role !== 'anonymous') {
      setIsAuth(true);
      setUser(data);
    } else {
      setIsAuth(false);
      setUser(undefined);
    }
  };
  useEffect(() => {
    checkAuth();
  }, []);

  const onChangeTerritory = (id: number) => {
    if (user) {
      setUser({...user, territory_id: id, operator_id: undefined});
    }
  };

  const onChangeOperator = (id: number) => {
    if (user) {
      setUser({...user, operator_id: id, territory_id: undefined});
    }
  };

  return(
    <AuthContext.Provider value={{isAuth,setIsAuth, user, onChangeTerritory, onChangeOperator}}>
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