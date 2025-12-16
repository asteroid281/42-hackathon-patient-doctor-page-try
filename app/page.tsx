"use client";

import { useState } from "react";
import ClinicSchedulerPanel from "@/components/clinic/ClinicSchedulerPanel";
import PatientDashboardPage from "@/components/clinic/PatientDashboardPage";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

export default function Page() {
  const [mode, setMode] = useState<"doctor" | "patient">("doctor");

  return (
    <main className="min-h-screen bg-background">
      <Toaster />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo / Title */}
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-primary">
                🏥 Klinik Randevu Sistemi
              </h1>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex gap-2">
            <Button
              variant={mode === "doctor" ? "default" : "outline"}
              onClick={() => setMode("doctor")}
              className="gap-2"
              aria-pressed={mode === "doctor"}
              aria-label="Doktor paneline geç"
            >
              👨‍⚕️ Doktor
            </Button>

            <Button
              variant={mode === "patient" ? "default" : "outline"}
              onClick={() => setMode("patient")}
              className="gap-2"
              aria-pressed={mode === "patient"}
              aria-label="Hasta paneline geç"
            >
              👤 Hasta
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-6" id="main-content">
        {mode === "doctor" ? <ClinicSchedulerPanel /> : <PatientDashboardPage />}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-6 text-center text-sm text-muted-foreground">
        <p>© 2025 Klinik Randevu Yönetim Sistemi. Tüm hakları saklıdır.</p>
      </footer>
    </main>
  );
}
