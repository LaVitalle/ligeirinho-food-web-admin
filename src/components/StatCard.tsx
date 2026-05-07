import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  accent?: "orange" | "green" | "red" | "neutral";
}

const accents = {
  orange: { bar: "bg-primary", iconBg: "bg-accent text-primary" },
  green: { bar: "bg-success", iconBg: "bg-success-soft text-success" },
  red: { bar: "bg-brand-red", iconBg: "bg-destructive/10 text-brand-red" },
  neutral: { bar: "bg-muted-foreground/40", iconBg: "bg-muted text-muted-foreground" },
};

export const StatCard = ({ label, value, unit, icon: Icon, accent = "orange" }: StatCardProps) => {
  const a = accents[accent];
  return (
    <div className="relative rounded-2xl bg-card border border-border shadow-card p-5 overflow-hidden">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", a.bar)} />
      <div className="flex items-start gap-4">
        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", a.iconBg)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold text-foreground leading-tight">
            {value}
            {unit && <span className="text-sm font-normal text-muted-foreground ml-1.5">{unit}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};
