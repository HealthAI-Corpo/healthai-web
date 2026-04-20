import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "outline" | "running";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border border-border text-muted-foreground",
  running: "bg-primary/15 text-primary border border-primary/30",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {variant === "running" && (
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// Mappage statut pipeline → variant badge
export function PipelineStatusBadge({
  status,
}: {
  status: "idle" | "running" | "success" | "error";
}) {
  const MAP: Record<typeof status, { variant: BadgeVariant; label: string }> = {
    idle: { variant: "outline", label: "En attente" },
    running: { variant: "running", label: "En cours" },
    success: { variant: "success", label: "Succès" },
    error: { variant: "destructive", label: "Erreur" },
  };

  const { variant, label } = MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
