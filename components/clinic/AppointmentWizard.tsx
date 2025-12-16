"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle as CardTitleComp } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIdempotencyKey } from "@/lib/hooks";

type WizardStep = "select-patient" | "confirm-slot" | "review";

interface AppointmentWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTime: string;
  selectedDate: string;
  doctorName: string;
  patients: Array<{ id: string; fullName: string; phone?: string }>;
  onConfirm: (payload: {
    patientId: string;
    date: string;
    time: string;
    reason: string;
    idempotencyKey: string;
  }) => void;
  isSubmitting?: boolean;
}

/**
 * AppointmentWizard Component
 * Multi-step form for booking appointments with semantic HTML
 * Implements:
 * - <form>, <fieldset>, <legend> for proper semantics
 * - <article> for step containers
 * - Idempotency Key for POST requests
 * - ARIA attributes for accessibility
 */
export const AppointmentWizard = React.forwardRef<HTMLDivElement, AppointmentWizardProps>(
  (
    {
      isOpen,
      onOpenChange,
      selectedTime,
      selectedDate,
      doctorName,
      patients,
      onConfirm,
      isSubmitting,
    },
    ref
  ) => {
    const [step, setStep] = React.useState<WizardStep>("select-patient");
    const [selectedPatientId, setSelectedPatientId] = React.useState<string>("");
    const [reason, setReason] = React.useState("");
    const idempotencyKey = useIdempotencyKey();

    const selectedPatient = patients.find((p) => p.id === selectedPatientId);

    const handleNext = () => {
      if (step === "select-patient" && !selectedPatientId) {
        alert("Lütfen bir hasta seçiniz");
        return;
      }
      if (step === "select-patient") {
        setStep("confirm-slot");
      } else if (step === "confirm-slot") {
        setStep("review");
      }
    };

    const handlePrev = () => {
      if (step === "confirm-slot") {
        setStep("select-patient");
      } else if (step === "review") {
        setStep("confirm-slot");
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPatientId) return;

      onConfirm({
        patientId: selectedPatientId,
        date: selectedDate,
        time: selectedTime,
        reason,
        idempotencyKey,
      });
    };

    const stepTitles: Record<WizardStep, string> = {
      "select-patient": "Hasta Seçimi",
      "confirm-slot": "Slot Onayı",
      review: "Özet ve Onay",
    };

    const currentStep = stepTitles[step];

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          ref={ref}
          className="max-w-md sm:max-w-lg"
          aria-labelledby="wizard-title"
          aria-describedby="wizard-description"
        >
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4 space-y-2">
              <DialogTitle id="wizard-title">Randevu Rezervasyonu</DialogTitle>
              <DialogDescription id="wizard-description">
                {currentStep}
              </DialogDescription>
            </div>

            {/* Step Indicator */}
            <div className="mb-6 flex justify-between" role="progressbar" aria-valuenow={
              step === "select-patient" ? 1 : step === "confirm-slot" ? 2 : 3
            } aria-valuemin={1} aria-valuemax={3}>
              {(["select-patient", "confirm-slot", "review"] as const).map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    (["select-patient", "confirm-slot", "review"] as const).indexOf(s) <
                    (["select-patient", "confirm-slot", "review"] as const).indexOf(step)
                      ? "bg-primary"
                      : (["select-patient", "confirm-slot", "review"] as const).indexOf(s) ===
                        (["select-patient", "confirm-slot", "review"] as const).indexOf(step)
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>

            {/* Step 1: Select Patient */}
            {step === "select-patient" && (
              <article className="space-y-4">
                <fieldset>
                  <legend className="mb-3 text-sm font-semibold">
                    Hasta Seçiniz
                  </legend>
                  <div className="space-y-2">
                    {patients.map((patient) => (
                      <label
                        key={patient.id}
                        className="flex items-center gap-3 cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted"
                      >
                        <input
                          type="radio"
                          name="patient"
                          value={patient.id}
                          checked={selectedPatientId === patient.id}
                          onChange={(e) => setSelectedPatientId(e.target.value)}
                          className="h-4 w-4"
                          aria-label={`${patient.fullName} seç`}
                        />
                        <div>
                          <p className="font-medium">{patient.fullName}</p>
                          {patient.phone && (
                            <p className="text-xs text-muted-foreground">
                              {patient.phone}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </article>
            )}

            {/* Step 2: Confirm Slot */}
            {step === "confirm-slot" && (
              <article className="space-y-4">
                <fieldset>
                  <legend className="mb-3 text-sm font-semibold">
                    Randevu Detayları
                  </legend>
                  <Card className="bg-muted/50">
                    <CardContent className="space-y-2 pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Tarih</p>
                        <p className="font-semibold">{selectedDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Saat</p>
                        <p className="font-semibold">{selectedTime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Doktor</p>
                        <p className="font-semibold">Dr. {doctorName}</p>
                      </div>
                    </CardContent>
                  </Card>
                </fieldset>

                <fieldset>
                  <label htmlFor="reason-input" className="text-sm font-semibold">
                    Sebep / Not (Opsiyonel)
                  </label>
                  <Textarea
                    id="reason-input"
                    placeholder="Randevu sebebini yazınız..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-2"
                    aria-describedby="reason-help"
                  />
                  <p id="reason-help" className="mt-1 text-xs text-muted-foreground">
                    Doktora ön bilgi sağlayabilirsiniz
                  </p>
                </fieldset>
              </article>
            )}

            {/* Step 3: Review */}
            {step === "review" && (
              <article className="space-y-4">
                <Card className="bg-green-50 dark:bg-green-950/30">
                  <CardHeader>
                    <CardTitleComp className="text-sm">Randevu Özeti</CardTitleComp>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Hasta</span>
                      <span className="font-semibold">{selectedPatient?.fullName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Doktor</span>
                      <span className="font-semibold">Dr. {doctorName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tarih & Saat</span>
                      <span className="font-semibold">
                        {selectedDate} {selectedTime}
                      </span>
                    </div>
                    {reason && (
                      <div className="flex items-start justify-between">
                        <span className="text-sm text-muted-foreground">Sebep</span>
                        <span className="font-semibold text-right">{reason}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    ✓ Randevu başarıyla oluşturulacaktır. Idempotency Key:
                    {" "}
                    <code className="text-xs font-mono">{idempotencyKey}</code>
                  </p>
                </div>
              </article>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex gap-2 justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={step === "select-patient"}
                aria-label="Önceki adıma git"
              >
                Geri
              </Button>

              {step !== "review" ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  aria-label={`${stepTitles[step]} adımını tamamla`}
                >
                  İleri
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  aria-label="Randevuyu onayla"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Onayla"}
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

AppointmentWizard.displayName = "AppointmentWizard";
