"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart3, Database, GitMerge,
  ShieldCheck, Download, Activity, Dumbbell, Apple,
  Users, ChevronRight, Sun, Moon, Eye, EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppTheme } from "@/lib/theme";
import Image from "next/image";

const NAV_SECTIONS = [
  {
    label: "Vue d'ensemble",
    items: [
      { href: "/overview",   icon: LayoutDashboard, label: "Dashboard",     description: "KPIs & métriques temps réel" },
      { href: "/analytics",  icon: BarChart3,        label: "Analytics",     description: "Visualisations & tendances" },
      { href: "/pipelines",  icon: GitMerge,         label: "Pipelines ETL", description: "Monitoring des flux" },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/datasets",   icon: Database,    label: "Datasets",   description: "Consultation & correction" },
      { href: "/validation", icon: ShieldCheck, label: "Validation", description: "Approbation des données" },
      { href: "/exports",    icon: Download,    label: "Exports",    description: "JSON & CSV" },
    ],
  },
  {
    label: "Données",
    items: [
      { href: "/analytics#users",     icon: Users,    label: "Membres",   description: "Gym Members Dataset" },
      { href: "/analytics#nutrition", icon: Apple,    label: "Nutrition",  description: "Food & Nutrition" },
      { href: "/analytics#exercises", icon: Dumbbell, label: "Exercices",  description: "ExerciseDB" },
      { href: "/analytics#biometrics",icon: Activity, label: "Biométrie",  description: "Fitness Tracker" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { colorTheme, accessibilityMode, toggleColorTheme, toggleAccessibilityMode, isLowVision } = useAppTheme();

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
          width={762}
          height={206}
          className="h-8 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin" aria-label="Menu principal">
        <ul className="space-y-6" role="list">
          {NAV_SECTIONS.map((section) => (
            <li key={section.label}>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {section.label}
              </p>
              <ul className="space-y-0.5" role="list">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href.split("#")[0]));
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
                        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} aria-hidden="true" />
                        <span className="flex-1 font-medium">{item.label}</span>
                        {isActive && <ChevronRight className="h-3 w-3 text-primary" aria-hidden="true" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Contrôles d'accessibilité ── */}
      <div className="border-t border-border p-4 space-y-2">
        <p className={cn("px-1 font-semibold uppercase tracking-widest text-muted-foreground", isLowVision ? "text-xs" : "text-[10px]")}>
          Accessibilité
        </p>

        {/* Bouton Jour / Nuit */}
        <button
          onClick={toggleColorTheme}
          aria-pressed={isDark}
          aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border border-border px-3 transition-colors",
            isLowVision ? "py-3 text-base" : "py-2 text-sm",
            "text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {isDark
            ? <Sun className="h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            : <Moon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          }
          <span className="flex-1 text-left font-medium">
            {isDark ? "Mode clair" : "Mode sombre"}
          </span>
          {/* Indicateur visuel on/off */}
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

        {/* Bouton Mode malvoyant */}
        <button
          onClick={toggleAccessibilityMode}
          aria-pressed={isLowVision}
          aria-label={isLowVision ? "Désactiver le mode malvoyant" : "Activer le mode malvoyant (contraste élevé, texte agrandi)"}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border transition-colors",
            isLowVision ? "py-3 text-base border-primary bg-primary/10" : "py-2 text-sm border-border",
            "text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring px-3"
          )}
        >
          {isLowVision
            ? <EyeOff className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            : <Eye className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          }
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

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold" aria-hidden="true">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("truncate font-medium text-foreground", isLowVision ? "text-sm" : "text-xs")}>Admin</p>
            <p className="truncate text-[10px] text-muted-foreground">admin@healthai.coach</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
