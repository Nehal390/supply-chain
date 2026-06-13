import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Box, BarChart3, Globe2, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="px-6 lg:px-14 py-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
          <Box className="w-6 h-6" />
          <span>Smart Supply Chain</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-medium" data-testid="link-login-ghost">Sign In</Button>
          </Link>
          <Link href="/login">
            <Button className="font-medium gap-2 shadow-sm shadow-primary/20" data-testid="link-login">
              Access Network <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Network Operations Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
            Resilient Logistics for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Modern India.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Coordinate a national network of large distribution hubs and last-mile Local Partner Shops from a single, operations-grade command center.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all" data-testid="button-hero-cta">
                Enter Command Center
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24 text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          <div className="p-6 rounded-2xl bg-card border shadow-sm flex flex-col gap-4 group hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Local Partner Shop Network</h3>
            <p className="text-muted-foreground">Distribute inventory closer to demand with our mesh network of Local Partner Shops across India.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card border shadow-sm flex flex-col gap-4 group hover:border-accent/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Predictive Fulfillment</h3>
            <p className="text-muted-foreground">AI-driven routing automatically assigns orders to the optimal facility based on distance, stock, and traffic.</p>
          </div>

          <div className="p-6 rounded-2xl bg-card border shadow-sm flex flex-col gap-4 group hover:border-chart-3/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center text-chart-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Operations Grade</h3>
            <p className="text-muted-foreground">Dense, reliable data displays designed for operations managers who keep this tool open all day.</p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-24 z-10 bg-background/80 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} Smart Supply Chain Network. All rights reserved.</p>
      </footer>
    </div>
  );
}