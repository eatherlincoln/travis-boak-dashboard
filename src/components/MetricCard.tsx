import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("shadow-card border-border/50 hover:shadow-ocean transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {trend && (
                <span className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-success" : "text-destructive"
                )}>
                  {trend.isPositive ? "+" : ""}{trend.value}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="text-primary opacity-80">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}