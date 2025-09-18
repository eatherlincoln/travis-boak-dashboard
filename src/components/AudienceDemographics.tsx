import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-gray-800 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AudienceDemographics() {
  return (
    <section className="py-6 md:py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gender Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gray-800" style={{ width: "88%" }} />
              </div>
              <div className="text-sm text-gray-600">88% Men · 12% Women</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Locations</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Australia</span>
              <span>51%</span>
            </div>
            <div className="flex justify-between">
              <span>USA</span>
              <span>10%</span>
            </div>
            <div className="flex justify-between">
              <span>Japan</span>
              <span>6%</span>
            </div>
            <div className="flex justify-between">
              <span>Brazil</span>
              <span>5%</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Cities: Sydney, Gold Coast, Melbourne, Sunshine Coast
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Age Groups</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Bar label="25–34" pct={31} />
            <Bar label="18–24" pct={22} />
            <Bar label="35–44" pct={21} />
            <Bar label="45–54" pct={16} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
