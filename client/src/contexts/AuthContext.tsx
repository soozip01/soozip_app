/**
 * SOOZIP 통합 인증 컨텍스트
 *
 * - Access Token: localStorage에 저장 (만료 시 자동 갱신)
 * - Refresh Token: HttpOnly 쿠키 (서버에서 관리, JS 접근 불가)
 * - 지원 로그인: 카카오 / 네이버 / 이메일
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { trpc } from "@/lib/trpc";

export type LoginProvider = "kakao" | "naver" | "email";

export interface SoozipUser {
  id: number;
  nickname: string;
  email?: string | null;
  provider: LoginProvider;
  profileImageUrl?: string | null;
  role?: string;
}

interface AuthContextType {
  user: SoozipUser | null;
  isLoggedIn: boolean;
  accessToken: string | null;
  login: (user: SoozipUser, accessToken: string) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  getValidToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  accessToken: null,
  login: () => {},
  logout: async () => {},
  refreshToken: async () => null,
  getValidToken: async () => null,
});

const ACCESS_TOKEN_KEY = "soozip_access_token";
const USER_KEY = "soozip_user";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() / 1000 >= (payload.exp as number) - 30;
  } catch {
    return true;
  }
}

export function SoozipAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SoozipUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? (JSON.parse(stored) as SoozipUser) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  });

  const refreshingRef = useRef<Promise<string | null> | null>(null);
  const utils = trpc.useUtils();

  const login = useCallback((newUser: SoozipUser, token: string) => {
    setUser(newUser);
    setAccessToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }, []);

  const logout = useCallback(async () => {
    try {
      await utils.client.auth.logoutUnified.mutate();
    } catch {
      // 서버 오류 무시
    }
    clearAuth();
  }, [utils, clearAuth]);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (refreshingRef.current) return refreshingRef.current;

    const doRefresh = async (): Promise<string | null> => {
      try {
        const result = await utils.client.auth.refreshToken.mutate();
        const newToken = result.accessToken;
        const newUser = result.user as SoozipUser;
        setAccessToken(newToken);
        setUser(newUser);
        localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        return newToken;
      } catch {
        clearAuth();
        return null;
      } finally {
        refreshingRef.current = null;
      }
    };

    refreshingRef.current = doRefresh();
    return refreshingRef.current;
  }, [utils, clearAuth]);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (!accessToken) return null;
    if (!isTokenExpired(accessToken)) return accessToken;
    return refreshToken();
  }, [accessToken, refreshToken]);

  // 앱 시작 시 만료된 토큰 자동 갱신
  useEffect(() => {
    if (accessToken && isTokenExpired(accessToken)) {
      refreshToken();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Access Token 만료 전 자동 갱신 타이머
  useEffect(() => {
    if (!accessToken) return;
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const exp = (payload.exp as number) * 1000;
      const delay = exp - Date.now() - 60 * 1000;
      if (delay <= 0) { refreshToken(); return; }
      const timer = setTimeout(() => { refreshToken(); }, delay);
      return () => clearTimeout(timer);
    } catch { /* 잘못된 토큰 무시 */ }
  }, [accessToken, refreshToken]);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user && !!accessToken, accessToken, login, logout, refreshToken, getValidToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSoozipAuth() {
  return useContext(AuthContext);
}
