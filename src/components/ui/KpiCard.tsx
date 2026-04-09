import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down" | "neutral";
  };
  variant?: "default" | "success" | "warning" | "destructive";
  className?: string;
}

const VARIANT_STYLES = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

const TREND_STYLES = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-muted-foreground",
};

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: KpiCardProps) {
  return (
    <article
      className={cn(
        "animate-fade-in rounded-xl border border-border bg-card p-6",
        className
      )}
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p className={cn("mt-2 text-xs font-medium", TREND_STYLES[trend.direction])}>
              {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}{" "}
              {trend.value > 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            VARIANT_STYLES[variant]
          )}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}
