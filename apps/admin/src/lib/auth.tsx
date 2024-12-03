import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { bareApiClient } from "./api";
import { jwtDecode } from "jwt-decode";

interface Admin {
  id: number;
  email: string;
  name: string;
  role: "rep" | "manager" | "controller";
  organizationId: number;
  avatar?: string | null;
}

interface AuthContextType {
  admin: Admin | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const TOKEN_KEY = 'sports_admin_token';

// Function to handle 401 responses globally
const setup401Handler = (logoutFn: () => Promise<any> | any) => {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (response.status === 401) {
      await logoutFn();
    }
    return response;
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await bareApiClient.auth.logout.$post();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setAdmin(null);
      navigate("/login");
    }
  };

  // Set up 401 handler once when component mounts
  useEffect(() => {
    setup401Handler(() => {console.log("401 handled"); });
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token validity
      try {
        const decoded = jwtDecode<Admin & { exp: number}>(token);
        // Check if token is expired (if exp claim exists)
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          await logout();
          return;
        }
        setAdmin(decoded);
      } catch (error) {
        console.error('Invalid token:', error);
        await logout();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await bareApiClient.auth.login.$post({
      json: { email, password },
    });

    if (!response.ok) {
      const error = await response.json();
      if ("message" in error) {
        throw new Error(error.message || "Login failed");
      }
    }

    const data = await response.json();
    if ("token" in data) {
      localStorage.setItem(TOKEN_KEY, data.token);
      const decodedToken = jwtDecode<Admin>(data.token);
      setAdmin(decodedToken);
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth(
  requiredRole?: "rep" | "manager" | "controller"
) {
  const { admin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !admin) {
      navigate("/login");
    }

    if (!isLoading && admin && requiredRole) {
      const roleLevel = {
        rep: 1,
        manager: 2,
        controller: 3,
      };

      if (roleLevel[admin.role] < roleLevel[requiredRole]) {
        navigate("/");
      }
    }
  }, [admin, isLoading, navigate, requiredRole]);

  return { admin, isLoading };
}

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "rep" | "manager" | "controller";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { admin, isLoading } = useRequireAuth(requiredRole);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!admin) {
    return null;
  }

  return <>{children}</>;
}
