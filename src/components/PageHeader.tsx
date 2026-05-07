import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, action, className }: PageHeaderProps) => (
  <div className={cn("flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6", className)}>
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
      {description && <p className="text-muted-foreground mt-1 text-sm md:text-base">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
