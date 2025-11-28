import { 
  LayoutDashboard, 
  BookOpen, 
  BarChart2, 
  Settings, 
  TrendingUp,
  Trophy
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Live Accounts", href: "/live-accounts", icon: LayoutDashboard },
    { name: "Journal", href: "/journal", icon: BookOpen },
    { name: "Prop Firms", href: "/prop-firms", icon: Trophy },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col fixed h-full z-50">
        <div className="p-6 flex items-center gap-2 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">TradePro</span>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                )}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border space-y-4">
           <div className="px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Account</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold">
                  JD
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">John Doe</span>
                  <span className="text-xs text-muted-foreground">Pro Member</span>
                </div>
              </div>
           </div>
           
           <Link href="/settings">
             <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground cursor-pointer">
               <Settings className="h-4 w-4 mr-2" />
               Settings
             </Button>
           </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen bg-background">
        {children}
      </main>
    </div>
  );
}
