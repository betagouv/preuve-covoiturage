"use client";
import { type AuthContextProps } from "@/interfaces/providersInterface";
import { createContext, useContext, useEffect, useState } from "react";
import { Config } from "../config";

const AuthContext = createContext<AuthContextProps | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<AuthContextProps["user"]>();
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const response = await fetch(
      `${Config.get<string>("auth.domain")}/auth/me`,
      {
        credentials: "include",
      },
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: AuthContextProps["user"] = await response.json();
    if (data?.role !== "anonymous") {
      setIsAuth(true);
      setUser(data);
    } else {
      setIsAuth(false);
      setUser(undefined);
    }
    setLoading(false);
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  const onChangeTerritory = (id?: number) => {
    if (user) {
      setUser({
        ...user,
        territory_id: id ?? undefined,
        operator_id: undefined,
      });
    }
  };

  const onChangeOperator = (id?: number) => {
    if (user) {
      setUser({
        ...user,
        operator_id: id ?? undefined,
        territory_id: undefined,
      });
    }
  };

  const logout = async () => {
    const response = await fetch(
      `${Config.get<string>("auth.domain")}/logout`,
      {
        method: "POST",
        credentials: "include",
      },
    );
    if (response.ok) {
      setIsAuth(false);
      setUser(undefined);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        setIsAuth,
        user,
        onChangeTerritory,
        onChangeOperator,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
