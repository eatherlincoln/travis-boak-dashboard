import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlatformCardProps {
  platform: string;
  handle: string;
  followers: string;
  icon: ReactNode;
  metrics: Array<{
    label: string;
    value: string;
    trend?: string;
  }>;
  highlights?: string[];
  className?: string;
  accentColor?: string;
}

export function PlatformCard({ 
  platform, 
  handle, 
  followers, 
  icon, 
  metrics, 
  highlights, 
  className,
  accentColor = "primary"
}: PlatformCardProps) {
  return (
    <Card className={cn("shadow-card border-border/50 hover:shadow-ocean transition-all duration-300", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className={cn("p-2 rounded-lg", `bg-${accentColor}/10`)}>
              {icon}
            </div>
            <div>
              <div className="font-bold">{platform}</div>
              <div className="text-sm text-muted-foreground font-normal">{handle}</div>
            </div>
          </CardTitle>
          <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
            {followers}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{metric.value}</p>
                {metric.trend && (
                  <span className="text-xs text-success">+{metric.trend}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {highlights && highlights.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Highlights</p>
            <div className="space-y-1">
              {highlights.map((highlight, index) => (
                <p key={index} className="text-sm bg-muted/50 p-2 rounded-md">
                  {highlight}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}