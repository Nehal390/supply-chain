import { createContext, useContext, ReactNode } from "react";
import { useGetMe, useLogin, useLogout, useRegister, User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: ReturnType<typeof useLogin>["mutate"];
  logout: ReturnType<typeof useLogout>["mutate"];
  register: ReturnType<typeof useRegister>["mutate"];
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isRegistering: boolean;
  loginError: string | null;
  registerError: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data, isLoading } = useGetMe();

  const user = data?.user ?? null;

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(["/api/auth/me"], { user: data });
        setLocation("/dashboard");
      },
    },
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(["/api/auth/me"], { user: null });
        setLocation("/login");
      },
    },
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(["/api/auth/me"], { user: data });
        setLocation("/dashboard");
      },
    },
  });

  const loginError =
    loginMutation.error instanceof Error
      ? ((loginMutation.error as any)?.response?.data?.error ?? loginMutation.error.message)
      : null;

  const registerError =
    registerMutation.error instanceof Error
      ? ((registerMutation.error as any)?.response?.data?.error ?? registerMutation.error.message)
      : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
        register: registerMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        isRegistering: registerMutation.isPending,
        loginError,
        registerError,
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
