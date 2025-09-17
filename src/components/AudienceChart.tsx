import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Users, MapPin, Calendar } from "lucide-react";

interface AudienceData {
  gender: { men: number; women: number };
  age: Array<{ range: string; percentage: number }>;
  countries: Array<{ country: string; percentage: number }>;
  cities: string[];
}

interface AudienceChartProps {
  data: AudienceData;
}

export function AudienceChart({ data }: AudienceChartProps) {
  return (
    <Card className="shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Audience Demographics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gender Distribution */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Gender Split
          </p>
          <div className="flex space-x-2">
            <div className="flex-1 bg-primary/20 rounded-full h-2 relative overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${data.gender.men}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span>{data.gender.men}% Men</span>
            <span>{data.gender.women}% Women</span>
          </div>
        </div>

        {/* Age Distribution */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Age Groups
          </p>
          <div className="space-y-2">
            {data.age.map((group, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{group.range}</span>
                  <span>{group.percentage}%</span>
                </div>
                <div className="bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (group.percentage /
                          Math.max(...data.age.map((g) => g.percentage))) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Top Locations
          </p>
          <div className="grid grid-cols-2 gap-3">
            {data.countries.map((country, index) => (
              <div key={index} className="bg-muted/30 p-2 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{country.country}</span>
                  <span className="text-sm text-muted-foreground">
                    {country.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">
              Top Cities: {data.cities.join(", ")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
