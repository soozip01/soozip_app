/**
 * SOOZIP 로컬 인증 컨텍스트
 * 카카오/네이버/이메일 로그인 상태를 localStorage로 관리
 * (Manus OAuth와 별개로 SOOZIP 자체 회원 시스템)
 */
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LoginProvider = "kakao" | "naver" | "email";

export interface SoozipUser {
  id: number | string;
  nickname: string;
  email?: string | null;
  provider: LoginProvider;
  profileImageUrl?: string | null;
}

interface AuthContextType {
  user: SoozipUser | null;
  isLoggedIn: boolean;
  login: (user: SoozipUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

const STORAGE_KEY = "soozip_user";

export function SoozipAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SoozipUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as SoozipUser) : null;
    } catch {
      return null;
    }
  });

  const login = (newUser: SoozipUser) => {
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSoozipAuth() {
  return useContext(AuthContext);
}
