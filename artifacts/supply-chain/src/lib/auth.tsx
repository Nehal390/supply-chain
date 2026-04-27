import { createContext, useContext, ReactNode, useEffect } from "react";
import { useGetMe, useLogin, useLogout, User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: ReturnType<typeof useLogin>["mutate"];
  logout: ReturnType<typeof useLogout>["mutate"];
  isLoggingIn: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data, isLoading } = useGetMe({
    query: {
      retry: false,
    }
  });

  const user = data?.user ?? null;

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(["/api/auth/me"], { user: data });
        setLocation("/dashboard");
      }
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(["/api/auth/me"], { user: null });
        setLocation("/login");
      }
    }
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
