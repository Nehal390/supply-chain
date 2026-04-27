import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Building2, 
  Package, 
  AlertTriangle, 
  Box, 
  ShoppingCart, 
  Bell, 
  BarChart3, 
  MessageSquare,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "retail", "customer"] },
  { name: "Map", href: "/map", icon: MapIcon, roles: ["admin", "manager", "retail"] },
  { name: "Locations", href: "/locations", icon: Building2, roles: ["admin", "manager"] },
  { name: "Inventory", href: "/inventory", icon: Package, roles: ["admin", "manager", "retail"] },
  { name: "Shortages", href: "/shortages", icon: AlertTriangle, roles: ["admin", "manager"] },
  { name: "Products", href: "/products", icon: Box, roles: ["admin", "manager"] },
  { name: "Orders", href: "/orders", icon: ShoppingCart, roles: ["admin", "manager", "retail", "customer"] },
  { name: "Alerts", href: "/alerts", icon: Bell, roles: ["admin", "manager"] },
  { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin", "manager"] },
  { name: "AI Assistant", href: "/assistant", icon: MessageSquare, roles: ["admin", "manager", "retail"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout, isLoggingOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user) return null;

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role) || user.role === 'admin');

  const NavContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4 font-bold text-primary gap-2">
        <Box className="h-6 w-6" />
        <span>Smart Supply Chain</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {filteredNav.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium leading-none">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2" 
          onClick={() => logout()}
          disabled={isLoggingOut}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-muted/40">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost" className="sm:hidden" data-testid="button-mobile-menu">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
        <div className="font-semibold text-primary flex items-center gap-2">
          <Box className="h-5 w-5" />
          Smart Supply Chain
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-background sm:flex shrink-0">
          <NavContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
