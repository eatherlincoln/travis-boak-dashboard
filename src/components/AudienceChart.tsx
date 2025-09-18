import React from "react";

export default function AudienceChart() {
  const age = [
    { label: "25–34", pct: 31 },
    { label: "18–24", pct: 22 },
    { label: "35–44", pct: 21 },
    { label: "45–54", pct: 16 },
  ];

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 md:p-6 shadow-sm">
      <h3 className="font-semibold mb-4">Audience Demographics</h3>

      <div className="mb-6">
        <div className="text-xs text-muted-foreground mb-2">Gender Split</div>
        <div className="h-2 rounded bg-muted">
          <div
            className="h-2 rounded bg-primary"
            style={{ width: "88%" }}
            title="Men 88%"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>88% Men</span>
          <span>12% Women</span>
        </div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-2">Age Groups</div>
        <div className="space-y-3">
          {age.map((a) => (
            <div key={a.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{a.label}</span>
                <span className="font-medium">{a.pct}%</span>
              </div>
              <div className="h-2 rounded bg-muted">
                <div
                  className="h-2 rounded bg-primary/80"
                  style={{ width: `${a.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Top Countries</div>
          <div>Australia (51%)</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">&nbsp;</div>
          <div>USA (10%)</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">&nbsp;</div>
          <div>Japan (6%)</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">&nbsp;</div>
          <div>Brazil (5%)</div>
        </div>
      </div>
    </div>
  );
}
