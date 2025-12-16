"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Welcome Banner Component
 * Displays welcome information and quick stats
 */
export const WelcomeBanner = ({
  userType,
  userName,
  stats,
}: {
  userType: "doctor" | "patient";
  userName?: string;
  stats?: Array<{ label: string; value: string | number }>;
}) => {
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi öğleden sonralar";
    return "İyi akşamlar";
  }, []);

  const emoji = userType === "doctor" ? "👨‍⚕️" : "👤";
  const title =
    userType === "doctor" ? "Doktor Paneline Hoşgeldiniz" : "Hasta Paneline Hoşgeldiniz";

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{emoji}</span>
            <div>
              <CardTitle className="text-2xl">
                {greeting}, {userName || "Hoşgeldin"}!
              </CardTitle>
              <CardDescription>{title}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      {stats && stats.length > 0 && (
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="rounded-lg bg-background/50 p-3 text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

WelcomeBanner.displayName = "WelcomeBanner";
