import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { Box, UserCircle } from "lucide-react";
import { Redirect } from "wouter";

const DEMO_USERS = [
  { email: "admin@scn.in", label: "Admin", role: "Network Administrator" },
  { email: "manager@scn.in", label: "Manager", role: "Warehouse Operations" },
  { email: "retail@scn.in", label: "Retail", role: "Retail Partner" },
  { email: "customer@scn.in", label: "Customer", role: "End Customer" },
];

export default function Login() {
  const { login, isLoggingIn, user } = useAuth();

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-muted/30 p-4 selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
            <Box className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Supply Chain</h1>
          <p className="text-muted-foreground">Sign in to access the network command center</p>
        </div>

        <Card className="border-primary/10 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle>Demo Access</CardTitle>
            <CardDescription>Select a role below to sign in instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_USERS.map((demo) => (
              <Button
                key={demo.email}
                variant="outline"
                className="w-full h-16 justify-start gap-4 px-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
                disabled={isLoggingIn}
                onClick={() => login({ data: { email: demo.email } })}
                data-testid={`button-login-${demo.label.toLowerCase()}`}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <UserCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{demo.label}</span>
                  <span className="text-xs text-muted-foreground">{demo.email} • {demo.role}</span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
