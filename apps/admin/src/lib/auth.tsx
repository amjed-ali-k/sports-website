import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

interface Admin {
  id: number;
  email: string;
  name: string;
  role: "rep" | "manager" | "controller";
}

interface AuthContextType {
  admin: Admin | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setAdmin(data);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();
    setAdmin(data);
    navigate("/");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAdmin(null);
    navigate("/login");
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
  requiredRole?: "rep" | "manager" | "controller",
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
