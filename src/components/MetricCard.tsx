import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Trend = { value: string; isPositive: boolean };
type Props = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: Trend;
};

export function MetricCard({ title, value, subtitle, icon, trend }: Props) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        {icon && <div className="text-gray-500">{icon}</div>}
        <div className="flex-1">
          <div className="text-xs text-gray-500">{title}</div>
          <div className="text-xl font-semibold">{value}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.value}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
