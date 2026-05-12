import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  googleIdTokenRequest,
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  registerRequest,
  type MeResponse,
} from '../api/auth-api';

type AuthContextValue = {
  readonly user: MeResponse | null;
  readonly accessToken: string | null;
  readonly bootstrapping: boolean;
  readonly login: (email: string, password: string) => Promise<void>;
  readonly register: (email: string, password: string) => Promise<void>;
  readonly loginWithGoogleIdToken: (idToken: string) => Promise<void>;
  readonly logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<MeResponse | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap(): Promise<void> {
      try {
        const tokens = await refreshRequest();
        if (cancelled) return;
        setAccessToken(tokens.accessToken);
        const profile = await meRequest(tokens.accessToken);
        if (cancelled) return;
        setUser(profile);
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await loginRequest(email, password);
    setAccessToken(tokens.accessToken);
    const profile = await meRequest(tokens.accessToken);
    setUser(profile);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const tokens = await registerRequest(email, password);
    setAccessToken(tokens.accessToken);
    const profile = await meRequest(tokens.accessToken);
    setUser(profile);
  }, []);

  const loginWithGoogleIdToken = useCallback(async (idToken: string) => {
    const tokens = await googleIdTokenRequest(idToken);
    setAccessToken(tokens.accessToken);
    const profile = await meRequest(tokens.accessToken);
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      bootstrapping,
      login,
      register,
      loginWithGoogleIdToken,
      logout,
    }),
    [
      user,
      accessToken,
      bootstrapping,
      login,
      register,
      loginWithGoogleIdToken,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
