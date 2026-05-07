import { cn } from "@/lib/utils";

const variants = {
  success: "bg-success-soft text-success",
  warning: "bg-accent text-primary",
  neutral: "bg-muted text-muted-foreground",
  danger: "bg-destructive/10 text-brand-red",
};

interface StatusBadgeProps {
  variant?: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge = ({ variant = "success", children, className }: StatusBadgeProps) => (
  <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", variants[variant], className)}>
    {children}
  </span>
);
