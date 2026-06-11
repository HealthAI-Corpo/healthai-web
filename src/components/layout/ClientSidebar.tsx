"use client";
 
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Salad, Dumbbell, LineChart, Sun, Moon, Eye, EyeOff, ChevronRight} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppTheme } from "@/lib/theme";
import Image from "next/image";
 
const NAV_ITEMS = [
  {
    href: "/client/dashboard",
    icon: LayoutDashboard,
    label: "Aperçu",
    description: "KPIs & résumé",
  },
  {
    href: "/client/nutrition",
    icon: Salad,
    label: "Nutrition",
    description: "Analyse repas & coach IA",
    premiumOnly: true,
  },
  {
    href: "/client/sport",
    icon: Dumbbell,
    label: "Entraînement",
    description: "Programme & coach IA",
    premiumOnly: true,
  },
  {
    href: "/client/suivi",
    icon: LineChart,
    label: "Mon suivi",
    description: "Courbes & profil",
  },
];
 
// Profil mock — à remplacer par useCurrentUser() en prod
const USER = {
  name: "Alexandre Martin",
  email: "alexandre@example.com",
  plan: "Premium" as const,
  initials: "AM",
};
 
export function ClientSidebar() {
  const pathname = usePathname();
  const {
    colorTheme,
    toggleColorTheme,
    toggleAccessibilityMode,
    isLowVision,
  } = useAppTheme();
 
  const isDark = colorTheme === "dark";
 
  return (
    <aside
      className="flex h-full w-64 flex-col border-r border-border bg-card"
      aria-label="Navigation principale"
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Image
          src="/wessim_logo-black.png"
          alt="HealthAI Coach"
          width={32}
          height={32}
          className="h-8 w-auto"
        />
      </div>
 
      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto p-4 scrollbar-thin"
        aria-label="Menu principal"
      >
        <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Mon espace
        </p>
        <ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150",
                    isLowVision ? "text-base" : "text-sm",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium flex items-center gap-2">
                      {item.label}
                      {item.premiumOnly && (
                        <span className="text-[9px] font-semibold uppercase tracking-wide bg-primary/10 text-primary rounded px-1 py-0.5">
                          Pro
                        </span>
                      )}
                    </span>
                    {!isLowVision && (
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <ChevronRight
                      className="h-3 w-3 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
 
      {/* Contrôles d'accessibilité */}
      <div className="border-t border-border p-4 space-y-2">
        <p
          className={cn(
            "px-1 font-semibold uppercase tracking-widest text-muted-foreground",
            isLowVision ? "text-xs" : "text-[10px]"
          )}
        >
          Accessibilité
        </p>
 
        <button
          type="button"
          onClick={toggleColorTheme}
          aria-pressed={isDark}
          aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border border-border px-3 transition-colors",
            isLowVision ? "py-3 text-base" : "py-2 text-sm",
            "text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {isDark ? (
            <Sun className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          )}
          <span className="flex-1 text-left font-medium">
            {isDark ? "Mode clair" : "Mode sombre"}
          </span>
          <span
            className={cn(
              "flex h-5 w-9 items-center rounded-full px-0.5 transition-colors",
              isDark ? "bg-primary justify-end" : "bg-muted justify-start"
            )}
            aria-hidden="true"
          >
            <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
          </span>
        </button>
 
        <button
          type="button"
          onClick={toggleAccessibilityMode}
          aria-pressed={isLowVision}
          aria-label={
            isLowVision
              ? "Désactiver le mode malvoyant"
              : "Activer le mode malvoyant"
          }
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border transition-colors px-3",
            isLowVision
              ? "py-3 text-base border-primary bg-primary/10"
              : "py-2 text-sm border-border",
            "text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {isLowVision ? (
            <EyeOff className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          <span className="flex-1 text-left font-medium">
            {isLowVision ? "Mode malvoyant ON" : "Mode malvoyant"}
          </span>
          <span
            className={cn(
              "flex h-5 w-9 items-center rounded-full px-0.5 transition-colors",
              isLowVision ? "bg-primary justify-end" : "bg-muted justify-start"
            )}
            aria-hidden="true"
          >
            <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
          </span>
        </button>
      </div>

      <div className="border-t border-border p-4">
        <Link
          href="/overview"
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Vue admin
        </Link>
      </div>
      
      {/* Footer utilisateur */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold"
            aria-hidden="true"
          >
            {USER.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate font-medium text-foreground",
                isLowVision ? "text-sm" : "text-xs"
              )}
            >
              {USER.name}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {USER.plan}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
