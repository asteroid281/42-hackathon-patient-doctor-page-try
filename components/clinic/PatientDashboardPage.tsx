"use client"; // Client Component: state + dialog + event için.

import * as React from "react"; // Hook’lar.
import { toast } from "sonner"; // Bildirim.

import { cn } from "@/lib/utils"; // Class helper.
import { Button } from "@/components/ui/button"; // shadcn.
import { Badge } from "@/components/ui/badge"; // shadcn.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // shadcn.
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // shadcn.
import { Textarea } from "@/components/ui/textarea"; // shadcn.

// =====================
// Tipler
// =====================

type Doctor = { id: string; name: string }; // Doktor tipi.

type Patient = {
  id: string; // Hasta ID.
  fullName: string; // Ad soyad.
  phone?: string; // Telefon.
};

type Appointment = {
  id: string; // Randevu ID.
  date: string; // YYYY-MM-DD.
  time: string; // HH:MM.
  doctorId: string; // Doktor ID.
  patientId: string; // Hasta ID.
  reason?: string; // Not.
};

type BlockedSlot = {
  id: string; // Blok ID.
  date: string; // YYYY-MM-DD.
  doctorId: string; // Doktor ID.
  time: string; // HH:MM.
  reason?: string; // Neden kapalı.
};


type PatientFileKind = "Röntgen" | "Rapor" | "Diğer"; // Hastanın ekleyeceği dosya kategorileri.

type PatientFile = {
  id: string; // Kayıt ID.
  kind: PatientFileKind; // Röntgen / Rapor / Diğer.
  name: string; // Dosya adı.
  size: number; // Byte cinsinden boyut.
  mime: string; // MIME type.
  url: string; // Önizleme için object URL.
  note?: string; // Opsiyonel not.
  createdAt: string; // Eklenme zamanı (ISO).
  file: File; // Gerçek dosya (ileride backend upload için).
};

// =====================
// Tarih / helper
// =====================

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return toISODate(dt);
}

function isWeekendISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay();
  return day === 0 || day === 6;
}

function isPastISO(iso: string, todayISO: string) {
  return iso < todayISO;
}

function formatBytes(bytes: number) {
  const kb = 1024; // 1 KB.
  const mb = kb * 1024; // 1 MB.
  if (bytes >= mb) return `${(bytes / mb).toFixed(2)} MB`; // MB ise MB yaz.
  if (bytes >= kb) return `${(bytes / kb).toFixed(1)} KB`; // KB ise KB yaz.
  return `${bytes} B`; // Değilse byte yaz.
}

type Row = { kind: "time"; start: string; end: string } | { kind: "break"; label: string };

function buildScheduleRows(): Row[] {
  const rows: Row[] = [];
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (h: number, m: number) => `${pad(h)}:${pad(m)}`;

  const addSlot = (h: number, m: number) => {
    const start = fmt(h, m);
    const endMinutes = h * 60 + m + 30;
    const end = fmt(Math.floor(endMinutes / 60), endMinutes % 60);
    rows.push({ kind: "time", start, end });
  };

  for (let h = 9; h <= 12; h++) {
    addSlot(h, 0);
    addSlot(h, 30);
  }

  rows.push({ kind: "break", label: "Mola (13:00–14:00)" });

  for (let h = 14; h <= 16; h++) {
    addSlot(h, 0);
    addSlot(h, 30);
  }

  return rows;
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "info" | "warn" | "danger" | "neutral";
  children: React.ReactNode;
}) {
  const cls =
    tone === "info"
      ? "border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-50"
      : tone === "warn"
      ? "border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-50"
      : tone === "danger"
      ? "border border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-50"
      : "border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-50";

  return <Badge className={cls}>{children}</Badge>;
}

// =====================
// Hasta Dashboard Page
// =====================

export default function PatientDashboardPage() {
  // ✅ Tek hasta: hasta seçimi yok (kendisini temsil ediyor).
  const me: Patient = { id: "p1", fullName: "Merve K.", phone: "05xx xxx xx xx" }; // Sabit hasta.
  const activePatientId = me.id; // Filtrelerde kullanılacak.

  // ---- Tarih / doktor seçimi ----
  const [selectedDate, setSelectedDate] = React.useState(() => toISODate(new Date()));
  const todayISO = React.useMemo(() => toISODate(new Date()), []);

  const doctors: Doctor[] = React.useMemo(
    () => [
      { id: "d1", name: "Dr. Aylin" },
      { id: "d2", name: "Dr. Emre" },
      { id: "d3", name: "Dr. Deniz" },
    ],
    []
  );

  const [activeDoctorId, setActiveDoctorId] = React.useState(doctors[0]?.id ?? "");

  const activeDoctorName = React.useMemo(
    () => doctors.find((d) => d.id === activeDoctorId)?.name ?? "Doktor",
    [doctors, activeDoctorId]
  );

  // ---- Hasta dosyaları (demo: sadece frontend state) ----
  const [fileKind, setFileKind] = React.useState<PatientFileKind>("Röntgen");
  const [fileNote, setFileNote] = React.useState("");
  const [patientFiles, setPatientFiles] = React.useState<PatientFile[]>([]);

  const filesRef = React.useRef<PatientFile[]>([]);

  React.useEffect(() => {
    filesRef.current = patientFiles;
  }, [patientFiles]);

  React.useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, []);

  function handleAddFiles(list: FileList | null) {
    if (!list || list.length === 0) return;

    const now = new Date().toISOString();

    const next: PatientFile[] = Array.from(list).map((f) => ({
      id: crypto.randomUUID(),
      kind: fileKind,
      name: f.name,
      size: f.size,
      mime: f.type || "application/octet-stream",
      url: URL.createObjectURL(f),
      note: fileNote.trim() || undefined,
      createdAt: now,
      file: f,
    }));

    setPatientFiles((prev) => [...next, ...prev]);
    toast.success("Dosya eklendi", { description: `${next.length} dosya` });
  }

  function removePatientFile(id: string) {
    setPatientFiles((prev) => {
      const hit = prev.find((x) => x.id === id);
      if (hit) URL.revokeObjectURL(hit.url);
      return prev.filter((x) => x.id !== id);
    });
  }


  // ---- Demo randevular + kapalı slotlar ----
  // Not: Burada başka hastaların randevuları da var ki slot doluluğu gerçekçi olsun.
  const [appointments, setAppointments] = React.useState<Appointment[]>(() => {
    const t = toISODate(new Date());
    return [
      { id: "a1", date: t, time: "10:00", doctorId: "d1", patientId: "p1", reason: "Kontrol" }, // benim
      { id: "a2", date: t, time: "10:30", doctorId: "d1", patientId: "p2", reason: "Yeni kayıt" }, // başkası
      { id: "a3", date: t, time: "15:00", doctorId: "d1", patientId: "p3", reason: "Ağrı şikayeti" }, // başkası
    ];
  });

  const [blockedSlots] = React.useState<BlockedSlot[]>([
    { id: "b1", date: toISODate(new Date()), doctorId: "d1", time: "11:00", reason: "Toplantı" },
  ]);

  // ---- Kapalı gün ----
  const globalClosed = isWeekendISO(selectedDate) || isPastISO(selectedDate, todayISO);

  // ---- Slot satırları ----
  const rows = React.useMemo(() => buildScheduleRows(), []);

  // ---- Seçili gün+doktor randevuları ----
  const dayAppointments = React.useMemo(
    () => appointments.filter((a) => a.date === selectedDate && a.doctorId === activeDoctorId),
    [appointments, selectedDate, activeDoctorId]
  );

  // ---- Slot kapalı mı ----
  const isBlockedAt = React.useCallback(
    (time: string) =>
      blockedSlots.some((b) => b.date === selectedDate && b.doctorId === activeDoctorId && b.time === time),
    [blockedSlots, selectedDate, activeDoctorId]
  );

  // ---- Slotta randevu var mı ----
  const apptAt = React.useCallback(
    (time: string) => dayAppointments.find((a) => a.time === time) ?? null,
    [dayAppointments]
  );

  // ---- Benim randevularım ----
  const myAppointments = React.useMemo(() => {
    return appointments
      .filter((a) => a.patientId === activePatientId)
      .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
  }, [appointments, activePatientId]);

  // ---- Bu gün bu doktorda benim randevum var mı? ----
  const myApptTodayHere = React.useMemo(() => {
    return dayAppointments.find((a) => a.patientId === activePatientId) ?? null;
  }, [dayAppointments, activePatientId]);

  function cancelAppointment(apptId: string) {
    setAppointments((prev) => prev.filter((a) => a.id !== apptId));
    toast.success("Randevu iptal edildi");
  }

  function bookAppointment(time: string, reason: string) {
    if (globalClosed) {
      toast("Bu gün kapalı", { description: "Geçmiş gün / haftasonu için randevu alınamaz." });
      return;
    }

    if (isBlockedAt(time)) {
      toast("Bu saat kapalı", { description: "Doktor bu saatte müsait değil." });
      return;
    }

    const conflict = appointments.some((a) => a.date === selectedDate && a.doctorId === activeDoctorId && a.time === time);
    if (conflict) {
      toast("Bu saat dolu", { description: "Başka bir saat seç." });
      return;
    }

    if (myApptTodayHere) {
      toast("Zaten randevun var", { description: `${myApptTodayHere.time} saatine randevun bulunuyor.` });
      return;
    }

    const appt: Appointment = {
      id: crypto.randomUUID(),
      date: selectedDate,
      time,
      doctorId: activeDoctorId,
      patientId: activePatientId,
      reason: reason.trim() || "Randevu",
    };

    setAppointments((prev) => [...prev, appt]);
    toast.success("Randevu alındı", { description: `${selectedDate} ${time}` });
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold">
              P
            </div>
            <div className="hidden min-[480px]:block">
              <p className="text-sm font-semibold leading-tight">Hasta Paneli</p>
              <p className="text-xs opacity-70">{me.fullName}</p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Tarih */}
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="border border-slate-200 dark:border-slate-800" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
              ◀
            </Button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            />

            <Button variant="secondary" className="border border-slate-200 dark:border-slate-800" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
              ▶
            </Button>
          </div>

          {globalClosed ? <StatusBadge tone="danger">Kapalı</StatusBadge> : <StatusBadge tone="info">Açık</StatusBadge>}
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px] px-3 py-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_420px]">
          {/* TAKVİM */}
          <main className="grid gap-3">
            <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40">
              <CardHeader className="pb-3">
                <CardTitle>Uygun Saatler</CardTitle>

              </CardHeader>

              <CardContent>
                {myApptTodayHere ? (
                  <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-50">
                    Bugün bu doktorda randevun var: <b>{myApptTodayHere.time}</b> •{" "}
                    <button className="underline" onClick={() => cancelAppointment(myApptTodayHere.id)}>
                      iptal et
                    </button>
                  </div>
                ) : null}

                <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="min-w-[720px]">
                    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/95">
                      <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-xs opacity-70">{selectedDate}</p>
                          <p className="text-2xl font-extrabold tracking-tight">{activeDoctorName}</p>
                        </div>

                        <div className="min-w-[220px]">
                          <p className="mb-1 text-xs opacity-70">Doktor değiştir</p>
                          <select
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                            value={activeDoctorId}
                            onChange={(e) => setActiveDoctorId(e.target.value)}
                          >
                            {doctors.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {rows.map((row, idx) => {
                      if (row.kind === "break") {
                        return (
                          <div
                            key={`break-${idx}`}
                            className="flex items-center justify-between border-t border-slate-200 px-3 py-3 text-sm opacity-80 dark:border-slate-800"
                          >
                            <span className="font-semibold">{row.label}</span>
                            <span>—</span>
                          </div>
                        );
                      }

                      const appt = apptAt(row.start);
                      const blocked = isBlockedAt(row.start);

                      const bookable = !globalClosed && !blocked && !appt && !myApptTodayHere;

                      return (
                        <div
                          key={row.start}
                          className={cn(
                            "flex items-stretch border-t border-slate-200 dark:border-slate-800",
                            blocked ? "bg-rose-50 dark:bg-rose-900/10" : appt ? "bg-slate-50 dark:bg-slate-900/20" : ""
                          )}
                        >
                          <div className="w-[170px] px-3 py-3 text-sm font-medium">
                            {row.start} - {row.end}
                            <div className="mt-1">
                              {globalClosed ? <StatusBadge tone="danger">Kapalı Gün</StatusBadge> : null}
                              {!globalClosed && blocked ? <StatusBadge tone="danger">Kapalı</StatusBadge> : null}
                              {!globalClosed && appt ? <StatusBadge tone="warn">Dolu</StatusBadge> : null}
                              {!globalClosed && !blocked && !appt ? <StatusBadge tone="info">Boş</StatusBadge> : null}
                            </div>
                          </div>

                          <div className="flex-1 px-3 py-3">
                            {appt ? (
                              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-950/40">
                                <p className="font-semibold">Bu saat dolu</p>
                                <p className="mt-1 text-xs opacity-70">Başka bir saat seç.</p>
                              </div>
                            ) : blocked ? (
                              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-50">
                                <p className="font-semibold">Doktor meşgul</p>
                                <p className="mt-1 text-xs opacity-70">Bu saat kapalı.</p>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm opacity-70">—</p>
                                <BookDialog disabled={!bookable} time={row.start} onConfirm={(reason) => bookAppointment(row.start, reason)} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>

          {/* SAĞ PANEL: Randevularım */}
          <aside className="grid gap-3">
            <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40">
              <CardHeader>
                <CardTitle className="text-base">Randevularım</CardTitle>
                <CardDescription>{me.fullName} için kayıtlı randevular.</CardDescription>
              </CardHeader>

              <CardContent>
                {myAppointments.length === 0 ? (
                  <p className="text-sm opacity-70">Henüz randevu yok.</p>
                ) : (
                  <ul className="grid gap-2">
                    {myAppointments.map((a) => {
                      const docName = doctors.find((d) => d.id === a.doctorId)?.name ?? a.doctorId;
                      const isPast = a.date < todayISO;
                      return (
                        <li
                          key={a.id}
                          className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/40"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold break-words">
                                {a.date} • {a.time}
                              </p>
                              <p className="mt-1 text-xs opacity-80">{docName}</p>
                              <p className="mt-1 text-xs opacity-70">{a.reason ?? "Randevu"}</p>
                            </div>

                            <Button
                              variant="secondary"
                              className="border border-slate-200 dark:border-slate-800"
                              disabled={isPast}
                              onClick={() => cancelAppointment(a.id)}
                            >
                              İptal
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>


            {/* SAĞ PANEL: Dosyalarım */}
            <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40">
              <CardHeader>
                <CardTitle className="text-base">Dosyalarım</CardTitle>
                <CardDescription>Röntgen / rapor gibi dosyaları profiline ekle.</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                      value={fileKind}
                      onChange={(e) => setFileKind(e.target.value as PatientFileKind)}
                    >
                      <option value="Röntgen">Röntgen</option>
                      <option value="Rapor">Rapor</option>
                      <option value="Diğer">Diğer</option>
                    </select>

                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      className="h-10 w-full min-w-[200px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                      onChange={(e) => {
                        handleAddFiles(e.target.files);
                        e.currentTarget.value = "";
                      }}
                    />
                  </div>

                  <Textarea
                    rows={2}
                    value={fileNote}
                    onChange={(e) => setFileNote(e.target.value)}
                    placeholder="Not (opsiyonel) — ör: 'MR sonucu', '2025 kontrol raporu'..."
                  />
                </div>

                <div className="mt-3 grid gap-2">
                  {patientFiles.length === 0 ? (
                    <p className="text-sm opacity-70">Henüz dosya eklenmedi.</p>
                  ) : (
                    <ul className="grid gap-2">
                      {patientFiles.map((f) => (
                        <li
                          key={f.id}
                          className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/40"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className="border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-50">
                                  {f.kind}
                                </Badge>
                                <a
                                  className="text-sm font-semibold underline break-words"
                                  href={f.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {f.name}
                                </a>
                              </div>

                              <p className="mt-1 text-xs opacity-70">
                                {formatBytes(f.size)} • {f.mime}
                              </p>

                              {f.note ? <p className="mt-1 text-xs opacity-80">{f.note}</p> : null}
                            </div>

                            <Button
                              variant="secondary"
                              className="border border-slate-200 dark:border-slate-800"
                              onClick={() => removePatientFile(f.id)}
                            >
                              Sil
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

// =====================
// Randevu alma dialog’u
// =====================

function BookDialog(props: { disabled: boolean; time: string; onConfirm: (reason: string) => void }) {
  const { disabled, time, onConfirm } = props;
  const [reason, setReason] = React.useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 text-white hover:bg-slate-700" disabled={disabled}>
          Randevu Al
        </Button>
      </DialogTrigger>

      <DialogContent aria-label="Randevu al">
        <DialogTitle>Randevu Al</DialogTitle>
        <DialogDescription>{time} saatine randevu oluştur.</DialogDescription>

        <div className="mt-3 grid gap-2">
          <label className="text-sm font-medium" htmlFor={`reason-${time}`}>
            Not (opsiyonel)
          </label>
          <Textarea
            id={`reason-${time}`}
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Şikayet / not..."
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary" className="border border-slate-200 dark:border-slate-800">
              Vazgeç
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              className="bg-slate-900 text-white hover:bg-slate-700"
              onClick={() => {
                onConfirm(reason);
                setReason("");
              }}
            >
              Onayla
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
