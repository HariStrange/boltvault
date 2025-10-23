import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Menu,
  X,
  Truck,
  Upload, // ✅ new icon for Passport Upload
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "driver", "welder", "student"],
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
    roles: ["admin", "driver", "welder"],
  },
  {
    title: "Passport Upload", // ✅ new
    href: "/dashboard/passport-upload",
    icon: Upload,
    roles: ["admin", "driver", "welder", "student"], // allow all roles
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin", "driver", "welder", "student"],
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        location.pathname === "/dashboard" ||
        location.pathname.startsWith("/dashboard/admin") ||
        location.pathname.startsWith("/dashboard/driver") ||
        location.pathname.startsWith("/dashboard/welder") ||
        location.pathname.startsWith("/dashboard/student")
      );
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {!isMobileOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-50"
          onClick={() => setIsMobileOpen(true)}
        >
          <Menu />
        </Button>
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border transition-transform duration-300 ease-in-out z-40",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full relative">
          <div className="p-3 border-b border-border">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary-500/20 transition-colors">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">Drive Vault</h2>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role}
                </p>
              </div>
            </Link>
          </div>

          {isMobileOpen && (
            <div className="lg:hidden absolute right-2 top-2 z-50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}

          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        active
                          ? "bg-primary text-foreground shadow-lg shadow-emerald-500/20"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
