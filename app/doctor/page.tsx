import type { Metadata } from "next";
import ClinicSchedulerPanel from "@/components/clinic/ClinicSchedulerPanel";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Doktor Paneli",
  description: "Doktor randevu yönetim ve planlama paneli",
};

export default function DoctorPage() {
  return (
    <main className="min-h-screen bg-background">
      <Toaster />

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-primary">
              👨‍⚕️ Doktor Paneli
            </h1>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-6" id="main-content">
        <ClinicSchedulerPanel />
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-6 text-center text-sm text-muted-foreground">
        <p>© 2025 Klinik Randevu Yönetim Sistemi. Tüm hakları saklıdır.</p>
      </footer>
    </main>
  );
}
