"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppointmentAgenda = {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  reason?: string;
  status: "upcoming" | "completed" | "cancelled";
};

interface AgendaViewProps {
  appointments: AppointmentAgenda[];
  onSelectAppointment?: (id: string) => void;
  className?: string;
}

const statusConfig = {
  upcoming: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-900 dark:text-blue-100",
    badge: "bg-blue-500 text-white",
  },
  completed: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-900 dark:text-green-100",
    badge: "bg-green-500 text-white",
  },
  cancelled: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-900 dark:text-red-100",
    badge: "bg-red-500 text-white",
  },
};

/**
 * AgendaView Component
 * Displays appointments in a mobile-friendly agenda/list format
 * Used on mobile screens (< 768px) and tablet screens (768px - 1024px)
 */
export const AgendaView = React.forwardRef<HTMLDivElement, AgendaViewProps>(
  ({ appointments, onSelectAppointment, className }, ref) => {
    // Group appointments by date
    const groupedAppointments = React.useMemo(() => {
      const groups: Record<string, AppointmentAgenda[]> = {};

      appointments.forEach((appt) => {
        if (!groups[appt.date]) {
          groups[appt.date] = [];
        }
        groups[appt.date].push(appt);
      });

      return groups;
    }, [appointments]);

    const sortedDates = React.useMemo(
      () => Object.keys(groupedAppointments).sort(),
      [groupedAppointments]
    );

    const formatDate = (isoDate: string) => {
      const [year, month, day] = isoDate.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString("tr-TR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return (
      <section
        ref={ref}
        className={cn("space-y-4", className)}
        data-testid="agenda-view"
        aria-label="Randevu listesi"
      >
        {sortedDates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Henüz randevunuz yok
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <section key={date} className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {formatDate(date)}
              </h3>
              <div className="space-y-2">
                {groupedAppointments[date].map((appt) => {
                  const config = statusConfig[appt.status];
                  return (
                    <Card
                      key={appt.id}
                      className={cn("cursor-pointer transition-colors hover:shadow-md", config.bg)}
                      onClick={() => onSelectAppointment?.(appt.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectAppointment?.(appt.id);
                        }
                      }}
                      aria-label={`${appt.time} - Dr. ${appt.doctorName}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <p className={cn("font-semibold", config.text)}>
                              {appt.time}
                            </p>
                            <p className="text-sm text-foreground">
                              Dr. {appt.doctorName}
                            </p>
                            {appt.reason && (
                              <p className="text-xs text-muted-foreground">
                                {appt.reason}
                              </p>
                            )}
                          </div>
                          <Badge className={config.badge}>
                            {appt.status === "upcoming"
                              ? "Gelecek"
                              : appt.status === "completed"
                              ? "Tamamlandı"
                              : "İptal Edildi"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </section>
    );
  }
);

AgendaView.displayName = "AgendaView";
