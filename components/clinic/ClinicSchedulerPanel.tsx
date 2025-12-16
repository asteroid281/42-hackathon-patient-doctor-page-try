"use client"; // Client Component: state + drag&drop + event’ler için gerekli.

import * as React from "react"; // React hook’ları için.
import { toast } from "sonner"; // Bildirim için (Toaster zaten sayfada var).

import { cn } from "@/lib/utils"; // Tailwind class birleştirme.
import { Button } from "@/components/ui/button"; // shadcn Button.
import { Badge } from "@/components/ui/badge"; // shadcn Badge.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // shadcn Card.
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // shadcn Dialog.
import { Textarea } from "@/components/ui/textarea"; // shadcn Textarea.

// =====================
// Tipler
// =====================

type Doctor = { id: string; name: string }; // Doktor tipi.

type Patient = {
  id: string; // Hasta ID.
  fullName: string; // Ad soyad.
  phone?: string; // Telefon.
  birthYear?: number; // Doğum yılı.
  notes?: string; // Notlar.
};

type Appointment = {
  id: string; // Randevu ID.
  date: string; // YYYY-MM-DD.
  time: string; // HH:MM.
  doctorId: string; // Doktor ID.
  patientId: string; // Hasta ID.
  reason?: string; // Sebep.
};

type BlockedSlot = {
  id: string; // Blok ID.
  date: string; // YYYY-MM-DD.
  doctorId: string; // Doktor ID.
  time: string; // HH:MM.
  reason?: string; // Neden kapalı.
};

type MediaKind = "xray" | "mr" | "prescription" | "report" | "other"; // Medya türleri.

type PatientMedia = {
  id: string; // Medya ID.
  patientId: string; // Hasta ID.
  kind: MediaKind; // Tür.
  fileName: string; // Dosya adı.
  url: string; // Demo object URL.
  uploadedAtISO: string; // Yükleme tarihi.
};

type PatientReport = {
  id: string; // Rapor ID.
  patientId: string; // Hasta ID.
  title: string; // Başlık.
  body: string; // İçerik.
  createdAtISO: string; // Tarih.
};

type ChatMessage = {
  id: string; // Mesaj ID.
  at: string; // HH:MM.
  from: "doctor" | "patient"; // Kimden.
  text: string; // Mesaj.
};

type ChatThread = {
  appointmentId: string; // Hangi randevu.
  started: boolean; // Başladı mı.
  messages: ChatMessage[]; // Mesajlar.
};

// =====================
// Tarih / saat helper
// =====================

function toISODate(d: Date) {
  const yyyy = d.getFullYear(); // Yıl.
  const mm = String(d.getMonth() + 1).padStart(2, "0"); // Ay.
  const dd = String(d.getDate()).padStart(2, "0"); // Gün.
  return `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD.
}

function addDays(iso: string, delta: number) {
  const [y, m, d] = iso.split("-").map(Number); // Parçala.
  const dt = new Date(y, m - 1, d); // Date'e çevir.
  dt.setDate(dt.getDate() + delta); // Gün ekle/çıkar.
  return toISODate(dt); // ISO döndür.
}

function isWeekendISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number); // Parçala.
  const dt = new Date(y, m - 1, d); // Date.
  const day = dt.getDay(); // 0 Pazar, 6 Cumartesi.
  return day === 0 || day === 6; // Haftasonu mu?
}

function isPastISO(iso: string, todayISO: string) {
  return iso < todayISO; // ISO string kıyas (format uygun).
}

function nowHHMM() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); // Şimdiki saat.
}

function minutesUntil(isoDate: string, hhmm: string) {
  const [y, m, d] = isoDate.split("-").map(Number); // Tarih.
  const [hh, mm] = hhmm.split(":").map(Number); // Saat.
  const target = new Date(y, m - 1, d, hh, mm, 0, 0).getTime(); // Hedef.
  const now = Date.now(); // Şimdi.
  return Math.round((target - now) / 60000); // Dakika farkı.
}

// =====================
// Slotlar
// =====================

type Row = { kind: "time"; start: string; end: string } | { kind: "break"; label: string }; // Satır tipi.

function buildScheduleRows(): Row[] {
  const rows: Row[] = []; // Satır listesi.
  const pad = (n: number) => String(n).padStart(2, "0"); // 2 haneli.
  const fmt = (h: number, m: number) => `${pad(h)}:${pad(m)}`; // HH:MM.

  const addSlot = (h: number, m: number) => {
    const start = fmt(h, m); // Başlangıç.
    const endMinutes = h * 60 + m + 30; // 30 dk sonrası.
    const end = fmt(Math.floor(endMinutes / 60), endMinutes % 60); // Bitiş.
    rows.push({ kind: "time", start, end }); // Ekle.
  };

  for (let h = 9; h <= 12; h++) {
    addSlot(h, 0); // 09:00, 10:00...
    addSlot(h, 30); // 09:30, 10:30...
  }

  rows.push({ kind: "break", label: "Mola (13:00–14:00)" }); // Öğle molası.

  for (let h = 14; h <= 16; h++) {
    addSlot(h, 0); // 14:00...
    addSlot(h, 30); // 14:30...
  }

  return rows; // Dön.
}

// =====================
// Badge helper
// =====================

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

  return <Badge className={cls}>{children}</Badge>; // Render.
}

function kindLabel(k: MediaKind) {
  if (k === "xray") return "Röntgen";
  if (k === "mr") return "MR";
  if (k === "prescription") return "Reçete";
  if (k === "report") return "Rapor (dosya)";
  return "Diğer";
}

// =====================
// ClinicSchedulerPanel (Doktor Dashboard)
// =====================

export default function ClinicSchedulerPanel() {
  // ✅ Tek doktor: doktor seçimi yok.
  const doctor: Doctor = { id: "d1", name: "Dr. Aylin" }; // Sabit doktor.
  const activeDoctorId = doctor.id; // Tüm filtrelerde kullanılacak.

  // ---- Tarih ----
  const [selectedDate, setSelectedDate] = React.useState(() => toISODate(new Date())); // Seçili gün.
  const todayISO = React.useMemo(() => toISODate(new Date()), []); // Bugün.

  // ---- Drag & Drop UI state ----
  const [draggingApptId, setDraggingApptId] = React.useState<string | null>(null); // Sürüklenen randevu.
  const [dragOverTime, setDragOverTime] = React.useState<string | null>(null); // Üzerinde olunan slot.

  // ---- Hastalar (demo) ----
  const [patients] = React.useState<Patient[]>([
    { id: "p1", fullName: "Merve K.", phone: "05xx xxx xx xx", birthYear: 1996, notes: "Alerji: Penisilin" },
    { id: "p2", fullName: "Ahmet T.", phone: "05xx xxx xx xx", birthYear: 1988, notes: "Diyabet" },
    { id: "p3", fullName: "Selin Y.", phone: "05xx xxx xx xx", birthYear: 2001, notes: "—" },
  ]);

  // ---- Randevular (demo) ----
  const [appointments, setAppointments] = React.useState<Appointment[]>(() => {
    const t = toISODate(new Date()); // Bugün.
    return [
      { id: "a1", date: t, time: "10:00", doctorId: doctor.id, patientId: "p1", reason: "Kontrol" },
      { id: "a2", date: t, time: "10:30", doctorId: doctor.id, patientId: "p2", reason: "Yeni kayıt" },
      { id: "a3", date: t, time: "15:00", doctorId: doctor.id, patientId: "p3", reason: "Ağrı şikayeti" },
    ];
  });

  // ---- Slot kapatma ----
  const [blockedSlots, setBlockedSlots] = React.useState<BlockedSlot[]>([
    { id: "b1", date: toISODate(new Date()), doctorId: doctor.id, time: "11:00", reason: "Toplantı" },
  ]);

  // ---- Medya + Raporlar ----
  const [media, setMedia] = React.useState<PatientMedia[]>([]); // Medyalar.
  const [reports, setReports] = React.useState<PatientReport[]>([
    {
      id: "r1",
      patientId: "p1",
      title: "Muayene Notu",
      body: "Genel durum iyi. 2 hafta sonra kontrol.",
      createdAtISO: new Date().toISOString(),
    },
  ]);

  // ---- Seçili randevu ----
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState<string | null>(null); // Sağ panel için.

  // ---- Chat thread ----
  const [threads, setThreads] = React.useState<Record<string, ChatThread>>({}); // appointmentId -> thread.

  // ---- Kapalı gün kontrolü ----
  const globalClosed = isWeekendISO(selectedDate) || isPastISO(selectedDate, todayISO); // Kapalı mı?

  // ---- Satırlar ----
  const rows = React.useMemo(() => buildScheduleRows(), []); // Slot satırları.

  // ---- Gün + doktor randevuları ----
  const dayAppointments = React.useMemo(
    () => appointments.filter((a) => a.date === selectedDate && a.doctorId === activeDoctorId),
    [appointments, selectedDate, activeDoctorId]
  );

  // ---- Tekil hasta sayısı ----
  const uniquePatientCount = React.useMemo(() => {
    const set = new Set(dayAppointments.map((a) => a.patientId)); // Set.
    return set.size; // Tekil hasta sayısı.
  }, [dayAppointments]);

  // ---- Kapalı slot sayısı ----
  const dayBlockedCount = React.useMemo(() => {
    return blockedSlots.filter((b) => b.date === selectedDate && b.doctorId === activeDoctorId).length;
  }, [blockedSlots, selectedDate, activeDoctorId]);

  // ---- Sonraki randevu ----
  const nextAppt = React.useMemo(() => {
    const sorted = [...dayAppointments].sort((a, b) => a.time.localeCompare(b.time)); // Saat sıralı.
    if (selectedDate !== todayISO) return sorted[0] ?? null; // Bugün değilse ilk.
    const now = nowHHMM(); // Şu an.
    return sorted.find((x) => x.time >= now) ?? sorted[0] ?? null; // Şimdiden sonraki.
  }, [dayAppointments, selectedDate, todayISO]);

  // ---- 7 gün özet ----
  const weekStats = React.useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i)); // 7 gün.
    return days.map((d) => {
      const list = appointments.filter((a) => a.date === d && a.doctorId === activeDoctorId); // Filtre.
      const uniq = new Set(list.map((a) => a.patientId)).size; // Tekil.
      return { date: d, appointmentCount: list.length, patientCount: uniq }; // Dön.
    });
  }, [appointments, selectedDate, activeDoctorId]);

  // ---- Hasta bul ----
  const getPatient = React.useCallback(
    (patientId: string) => patients.find((p) => p.id === patientId) ?? null,
    [patients]
  );

  // ---- Slotta randevu bul ----
  const findApptAt = React.useCallback(
    (time: string) => dayAppointments.find((a) => a.time === time) ?? null,
    [dayAppointments]
  );

  // ---- Slot kapalı mı ----
  const isBlockedAt = React.useCallback(
    (time: string) =>
      blockedSlots.some((b) => b.date === selectedDate && b.doctorId === activeDoctorId && b.time === time),
    [blockedSlots, selectedDate, activeDoctorId]
  );

  // ---- Slot etiketi ----
  function slotLabel(time: string) {
    if (globalClosed) return "Kapalı Gün";
    if (isBlockedAt(time)) return "Doktor Kapalı";
    if (findApptAt(time)) return "Dolu";
    return "Boş";
  }

  // ---- Slot kapat/aç ----
  function toggleBlockSlot(time: string, reason?: string) {
    if (globalClosed) {
      toast("Bu gün kapalı", { description: "Geçmiş gün / haftasonunda düzenleme yok." });
      return;
    }

    const exists = blockedSlots.find((b) => b.date === selectedDate && b.doctorId === activeDoctorId && b.time === time);

    if (exists) {
      setBlockedSlots((prev) => prev.filter((b) => b.id !== exists.id));
      toast.success("Saat açıldı", { description: `${selectedDate} ${time}` });
      return;
    }

    if (findApptAt(time)) {
      toast("Bu slot dolu", { description: "Önce randevuyu taşı/iptal et, sonra saati kapat." });
      return;
    }

    const b: BlockedSlot = {
      id: crypto.randomUUID(),
      date: selectedDate,
      doctorId: activeDoctorId,
      time,
      reason: reason?.trim() || "Meşgul",
    };

    setBlockedSlots((prev) => [b, ...prev]);
    toast.success("Saat kapatıldı", { description: `${selectedDate} ${time} • ${b.reason}` });
  }

  // =====================
  // DRAG & DROP
  // =====================

  function canDropOnTime(targetTime: string) {
    if (globalClosed) return false; // Kapalı gün.
    if (isBlockedAt(targetTime)) return false; // Kapalı slot.
    return true; // Drop olabilir.
  }

  function moveOrSwapAppointment(sourceApptId: string, targetTime: string) {
    const source = appointments.find((a) => a.id === sourceApptId) ?? null; // Kaynağı bul.
    if (!source) return; // Yoksa çık.

    if (source.date !== selectedDate || source.doctorId !== activeDoctorId) {
      toast("Bu görünüm dışında taşıma yok", { description: "Sadece seçili gün içinde taşı." });
      return;
    }

    if (!canDropOnTime(targetTime)) {
      toast("Bu slota bırakılamaz", { description: "Kapalı gün veya kapalı slot." });
      return;
    }

    const target = dayAppointments.find((a) => a.time === targetTime) ?? null; // Hedefte randevu var mı?

    if (targetTime === source.time) return; // Aynı slota bırakıldıysa çık.

    if (!target) {
      // Boş slota taşı.
      setAppointments((prev) => prev.map((a) => (a.id === sourceApptId ? { ...a, time: targetTime } : a)));
      toast.success("Randevu taşındı", { description: `${source.time} → ${targetTime}` });
      return;
    }

    // Dolu slota bırakıldıysa SWAP.
    if (isBlockedAt(source.time)) {
      toast("Swap yapılamadı", { description: "Kaynak slot kapalı görünüyor." });
      return;
    }

    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === sourceApptId) return { ...a, time: targetTime };
        if (a.id === target.id) return { ...a, time: source.time };
        return a;
      })
    );

    toast.success("Randevular yer değiştirdi", { description: `${source.time} ⇄ ${targetTime}` });
  }

  // =====================
  // Seçili randevu/hasta
  // =====================

  const selectedAppointment = React.useMemo(
    () => (selectedAppointmentId ? appointments.find((a) => a.id === selectedAppointmentId) ?? null : null),
    [selectedAppointmentId, appointments]
  );

  const selectedPatient = React.useMemo(() => {
    if (!selectedAppointment) return null;
    return getPatient(selectedAppointment.patientId);
  }, [selectedAppointment, getPatient]);

  const selectedPatientMedia = React.useMemo(() => {
    if (!selectedPatient) return [];
    return media.filter((m) => m.patientId === selectedPatient.id);
  }, [media, selectedPatient]);

  const selectedPatientReports = React.useMemo(() => {
    if (!selectedPatient) return [];
    return reports
      .filter((r) => r.patientId === selectedPatient.id)
      .sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO));
  }, [reports, selectedPatient]);

  // =====================
  // Pager Chat (aynı)
  // =====================

  const candidateChats = React.useMemo(() => {
    if (selectedDate !== todayISO) return [];
    const sorted = [...dayAppointments].sort((a, b) => a.time.localeCompare(b.time));
    return sorted.map((a) => ({ appt: a, minutes: minutesUntil(a.date, a.time) }));
  }, [dayAppointments, selectedDate, todayISO]);

  const [activeChatApptId, setActiveChatApptId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!nextAppt) {
      setActiveChatApptId(null);
      return;
    }
    setActiveChatApptId((prev) => prev ?? nextAppt.id);
  }, [nextAppt?.id]);

  const activeChatAppt = React.useMemo(() => {
    if (!activeChatApptId) return null;
    return appointments.find((a) => a.id === activeChatApptId) ?? null;
  }, [activeChatApptId, appointments]);

  const activeChatPatient = React.useMemo(() => {
    if (!activeChatAppt) return null;
    return getPatient(activeChatAppt.patientId);
  }, [activeChatAppt, getPatient]);

  const activeThread = React.useMemo(() => {
    if (!activeChatAppt) return null;
    return threads[activeChatAppt.id] ?? { appointmentId: activeChatAppt.id, started: false, messages: [] };
  }, [threads, activeChatAppt]);

  const canStartChat = React.useMemo(() => {
    if (!activeChatAppt) return false;
    if (activeChatAppt.date !== todayISO) return false;
    const min = minutesUntil(activeChatAppt.date, activeChatAppt.time);
    return min <= 120 && min >= -15;
  }, [activeChatAppt, todayISO]);

  function startChat() {
    if (!activeChatAppt) return;
    if (!canStartChat) {
      toast("Sohbet başlatılamadı", { description: "Sadece saati yaklaşan randevularda başlat." });
      return;
    }

    setThreads((prev) => {
      const existing = prev[activeChatAppt.id];
      if (existing?.started) return prev;

      const seed: ChatThread = {
        appointmentId: activeChatAppt.id,
        started: true,
        messages: [
          {
            id: crypto.randomUUID(),
            at: nowHHMM(),
            from: "doctor",
            text: "Merhaba, birazdan randevunuz başlayacak. Hazır olduğunuzda yazabilirsiniz.",
          },
        ],
      };

      return { ...prev, [activeChatAppt.id]: seed };
    });

    toast.success("Pager Chat başlatıldı");
  }

  function sendChat(text: string) {
    const t = text.trim();
    if (!t) return;
    if (!activeChatAppt) return;

    if (!activeThread?.started) {
      toast("Önce sohbeti başlat", { description: "‘Sohbet Başlat’ butonunu kullan." });
      return;
    }

    setThreads((prev) => {
      const cur = prev[activeChatAppt.id] ?? { appointmentId: activeChatAppt.id, started: true, messages: [] };
      const msg: ChatMessage = { id: crypto.randomUUID(), at: nowHHMM(), from: "doctor", text: t };
      return { ...prev, [activeChatAppt.id]: { ...cur, messages: [...cur.messages, msg] } };
    });
  }

  // =====================
  // UI
  // =====================

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-xl focus:bg-slate-900 focus:px-3 focus:py-2 focus:text-white"
      >
        İçeriğe geç
      </a>

      {/* TOP BAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold">
              D
            </div>
            <div className="hidden min-[480px]:block">
              <p className="text-sm font-semibold leading-tight">Doktor Dashboard</p>
              <p className="text-xs opacity-70">Takvim • Hasta • Medya • Pager Chat</p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Tarih */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="border border-slate-200 dark:border-slate-800"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
              aria-label="Önceki gün"
            >
              ◀
            </Button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
              aria-label="Tarih seç"
            />

            <Button
              variant="secondary"
              className="border border-slate-200 dark:border-slate-800"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              aria-label="Sonraki gün"
            >
              ▶
            </Button>
          </div>

          {/* ✅ Doktor seçimi yok: sadece isim */}
          <div className="hidden md:block min-w-[170px] text-sm font-semibold opacity-80">
            {doctor.name}
          </div>

          {globalClosed ? (
            <StatusBadge tone="danger">
              {isPastISO(selectedDate, todayISO) ? "🚫 Geçmiş gün kapalı" : "🚫 Haftasonu kapalı"}
            </StatusBadge>
          ) : (
            <StatusBadge tone="info">Açık</StatusBadge>
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] px-3 py-3">
        <div className="grid gap-3 lg:grid-cols-[260px_1fr_420px]">
          {/* SOL NAV */}
          <aside className="hidden lg:block">
            <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40">
              <CardHeader>
                <CardTitle className="text-base">Menü</CardTitle>
                <CardDescription>Doktor paneli gezinmesi.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {["Dashboard", "Takvim", "Hastalar", "Raporlar", "Ayarlar"].map((x, i) => (
                  <button
                    key={x}
                    type="button"
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                      i === 0 ? "bg-slate-900 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-900/40"
                    )}
                    onClick={() => toast("Demo", { description: `${x} sayfası daha sonra bağlanacak.` })}
                  >
                    {x}
                  </button>
                ))}

                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs opacity-80 dark:border-slate-800 dark:bg-slate-950/40">
                  <p className="font-semibold">İpucu</p>
                  <p className="mt-1">
                    Randevuyu karttan tutup başka saate <b>sürükle-bırak</b> yapabilirsin. Dolu slota bırakırsan swap yapar.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* ANA */}
          <main id="main" className="grid gap-3">
            {/* KPI */}
            <section className="grid gap-2 min-[480px]:grid-cols-2 xl:grid-cols-4">
              <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40">
                <CardHeader className="pb-2">
                  <CardDescription>Randevu (gün)</CardDescription>
                  <CardTitle className="text-lg">{dayAppointments.length}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs opacity-80">Seçili gün</CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40">
                <CardHeader className="pb-2">
                  <CardDescription>Hasta (tekil)</CardDescription>
                  <CardTitle className="text-lg">{uniquePatientCount}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs opacity-80">Aynı gün tekrar sayılmaz</CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40">
                <CardHeader className="pb-2">
                  <CardDescription>Kapalı saat</CardDescription>
                  <CardTitle className="text-lg">{dayBlockedCount}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs opacity-80">Doktor müsait değil</CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40">
                <CardHeader className="pb-2">
                  <CardDescription>Sonraki randevu</CardDescription>
                  <CardTitle className="text-lg">{nextAppt ? nextAppt.time : "—"}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs opacity-80">
                  {nextAppt ? getPatient(nextAppt.patientId)?.fullName ?? "—" : "Kayıt yok"}
                </CardContent>
              </Card>
            </section>

            {/* 7 gün özet */}
            <section>
              <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40">
                <CardHeader>
                  <CardTitle className="text-base">Gün gün özet (7 gün)</CardTitle>
                  <CardDescription>Randevu + tekil hasta sayısı.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900/40">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">Tarih</th>
                          <th className="px-3 py-2 text-left font-semibold">Randevu</th>
                          <th className="px-3 py-2 text-left font-semibold">Hasta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weekStats.map((s) => (
                          <tr key={s.date} className="border-t border-slate-200 dark:border-slate-800">
                            <td className="px-3 py-2">{s.date}</td>
                            <td className="px-3 py-2">{s.appointmentCount}</td>
                            <td className="px-3 py-2">{s.patientCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* TAKVİM */}
            <section aria-label="Takvim">
              <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40">
                <CardHeader>
                  <CardTitle>Takvim</CardTitle>
                  <CardDescription>
                    {selectedDate} • {doctor.name}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="min-w-[720px]">
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

                        const appt = findApptAt(row.start); // Bu saate randevu var mı?
                        const blocked = isBlockedAt(row.start); // Kapalı mı?
                        const label = slotLabel(row.start); // Etiket.

                        const highlight =
                          draggingApptId && dragOverTime === row.start && canDropOnTime(row.start);

                        const onDropToThisTime = (e: React.DragEvent) => {
                          e.preventDefault();
                          const sourceId = e.dataTransfer.getData("text/plain");
                          if (!sourceId) return;
                          moveOrSwapAppointment(sourceId, row.start);
                          setDragOverTime(null);
                        };

                        const onDragOverThisTime = (e: React.DragEvent) => {
                          if (!draggingApptId) return;
                          if (!canDropOnTime(row.start)) return;
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        };

                        return (
                          <div
                            key={row.start}
                            onDragOver={onDragOverThisTime}
                            onDrop={onDropToThisTime}
                            onDragEnter={() => setDragOverTime(row.start)}
                            onDragLeave={() => setDragOverTime((prev) => (prev === row.start ? null : prev))}
                            className={cn(
                              "flex items-stretch border-t border-slate-200 dark:border-slate-800",
                              blocked ? "bg-rose-50 dark:bg-rose-900/10" : appt ? "bg-slate-50 dark:bg-slate-900/20" : "",
                              highlight ? "outline outline-2 outline-slate-400 outline-offset-[-2px]" : ""
                            )}
                          >
                            <div className="w-[170px] px-3 py-3 text-sm font-medium">
                              {row.start} - {row.end}
                              <div className="mt-1">
                                {label === "Boş" ? <StatusBadge tone="info">Boş</StatusBadge> : null}
                                {label === "Dolu" ? <StatusBadge tone="warn">⛔ Dolu</StatusBadge> : null}
                                {label === "Doktor Kapalı" ? <StatusBadge tone="danger">🚫 Kapalı</StatusBadge> : null}
                                {label === "Kapalı Gün" ? <StatusBadge tone="danger">🚫 Kapalı Gün</StatusBadge> : null}
                              </div>
                            </div>

                            <div className="flex-1 px-3 py-3">
                              {appt ? (
                                <div
                                  draggable={!globalClosed}
                                  onDragStart={(e) => {
                                    setDraggingApptId(appt.id);
                                    e.dataTransfer.setData("text/plain", appt.id);
                                    e.dataTransfer.effectAllowed = "move";
                                  }}
                                  onDragEnd={() => {
                                    setDraggingApptId(null);
                                    setDragOverTime(null);
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setSelectedAppointmentId(appt.id)}
                                  onKeyDown={(ev) => {
                                    if (ev.key === "Enter" || ev.key === " ") setSelectedAppointmentId(appt.id);
                                  }}
                                  className={cn(
                                    "w-full cursor-move select-none rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:bg-slate-50",
                                    "dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900/30"
                                  )}
                                >
                                  <p className="text-sm font-semibold">
                                    {getPatient(appt.patientId)?.fullName ?? appt.patientId}
                                  </p>
                                  <p className="mt-1 text-xs opacity-80">{appt.reason ?? "Randevu"}</p>
                                  <p className="mt-2 text-xs opacity-70">
                                    Sürükle-bırak ile saat değiştir • Dolu slota bırakırsan swap yapar
                                  </p>
                                </div>
                              ) : blocked ? (
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm opacity-80">Doktor bu saatte meşgul.</p>
                                  <Button
                                    variant="secondary"
                                    className="border border-slate-200 dark:border-slate-800"
                                    disabled={globalClosed}
                                    onClick={() => toggleBlockSlot(row.start)}
                                  >
                                    Aç
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm opacity-70">—</p>
                                  <BlockSlotDialog
                                    disabled={globalClosed}
                                    time={row.start}
                                    onConfirm={(reason) => toggleBlockSlot(row.start, reason)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      className="bg-slate-900 text-white hover:bg-slate-700"
                      onClick={() => {
                        if (globalClosed) return;

                        const sample: Appointment = {
                          id: crypto.randomUUID(),
                          date: selectedDate,
                          time: "09:00",
                          doctorId: activeDoctorId,
                          patientId: "p1",
                          reason: "Demo randevu",
                        };

                        const conflict = appointments.some(
                          (a) => a.date === sample.date && a.doctorId === sample.doctorId && a.time === sample.time
                        );
                        if (conflict) {
                          toast("Çakışma", { description: "09:00 zaten dolu." });
                          return;
                        }

                        setAppointments((prev) => [...prev, sample]);
                        toast.success("Randevu eklendi (demo)");
                      }}
                    >
                      + Demo Randevu Ekle
                    </Button>

                    <Button
                      variant="secondary"
                      className="border border-slate-200 dark:border-slate-800"
                      onClick={() => setSelectedAppointmentId(null)}
                    >
                      Seçimi Temizle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </main>

          {/* SAĞ PANEL */}
          <aside className="grid gap-3" aria-label="Sağ panel">
            <PatientPanel
              selectedAppointment={selectedAppointment}
              patient={selectedPatient}
              patientMedia={selectedPatientMedia}
              patientReports={selectedPatientReports}
              onUploadMedia={(payload) => {
                if (!selectedPatient) return;
                setMedia((prev) => [
                  {
                    id: crypto.randomUUID(),
                    patientId: selectedPatient.id,
                    kind: payload.kind,
                    fileName: payload.fileName,
                    url: payload.url,
                    uploadedAtISO: new Date().toISOString(),
                  },
                  ...prev,
                ]);
                toast.success("Medya yüklendi (demo)");
              }}
              onAddReport={(title, body) => {
                if (!selectedPatient) return;
                setReports((prev) => [
                  {
                    id: crypto.randomUUID(),
                    patientId: selectedPatient.id,
                    title,
                    body,
                    createdAtISO: new Date().toISOString(),
                  },
                  ...prev,
                ]);
                toast.success("Rapor eklendi");
              }}
              onDeleteReport={(reportId) => {
                setReports((prev) => prev.filter((r) => r.id !== reportId));
                toast.success("Rapor silindi");
              }}
              onCancelAppointment={() => {
                if (!selectedAppointment) return;
                setAppointments((prev) => prev.filter((a) => a.id !== selectedAppointment.id));
                setSelectedAppointmentId(null);
                toast.success("Randevu iptal edildi");
              }}
            />

            <PagerChatPanel
              selectedDate={selectedDate}
              todayISO={todayISO}
              candidates={candidateChats}
              activeChatApptId={activeChatApptId}
              setActiveChatApptId={setActiveChatApptId}
              activeChatAppt={activeChatAppt}
              activeChatPatient={activeChatPatient}
              thread={activeThread}
              canStartChat={canStartChat}
              onStartChat={startChat}
              onSend={sendChat}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

// =====================
// Slot kapatma dialog’u
// =====================

function BlockSlotDialog(props: { disabled: boolean; time: string; onConfirm: (reason: string) => void }) {
  const { disabled, time, onConfirm } = props;
  const [reason, setReason] = React.useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="border border-slate-200 dark:border-slate-800" disabled={disabled}>
          Kapat
        </Button>
      </DialogTrigger>

      <DialogContent aria-label="Saat kapatma">
        <DialogTitle>Saati kapat</DialogTitle>
        <DialogDescription>{time} slotu için bir açıklama yaz.</DialogDescription>

        <div className="mt-3 grid gap-2">
          <label className="text-sm font-medium" htmlFor={`reason-${time}`}>
            Neden
          </label>
          <input
            id={`reason-${time}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Örn: ameliyat, toplantı, izin…"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="secondary" className="border border-slate-200 dark:border-slate-800">
              İptal
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
              Kaydet
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =====================
// Hasta paneli (doktor tarafı)
// =====================

function PatientPanel(props: {
  selectedAppointment: Appointment | null;
  patient: Patient | null;
  patientMedia: PatientMedia[];
  patientReports: PatientReport[];
  onUploadMedia: (payload: { kind: MediaKind; fileName: string; url: string }) => void;
  onAddReport: (title: string, body: string) => void;
  onDeleteReport: (reportId: string) => void;
  onCancelAppointment: () => void;
}) {
  const {
    selectedAppointment,
    patient,
    patientMedia,
    patientReports,
    onUploadMedia,
    onAddReport,
    onDeleteReport,
    onCancelAppointment,
  } = props;

  const [uploadKind, setUploadKind] = React.useState<MediaKind>("xray");
  const [reportTitle, setReportTitle] = React.useState("");
  const [reportBody, setReportBody] = React.useState("");

  function handleFile(file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUploadMedia({ kind: uploadKind, fileName: file.name, url });
  }

  return (
    <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40">
      <CardHeader>
        <CardTitle className="text-base">Hasta</CardTitle>
        <CardDescription>Randevu seçince detaylar burada görünür.</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3">
        {!selectedAppointment || !patient ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm opacity-80 dark:border-slate-800 dark:bg-slate-900/20">
            Henüz randevu seçilmedi.
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/30">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold break-words">{patient.fullName}</p>
                  <p className="mt-1 text-xs opacity-80">
                    Telefon: {patient.phone ?? "—"} • Doğum: {patient.birthYear ?? "—"}
                  </p>
                  <p className="mt-2 text-xs opacity-80">Not: {patient.notes ?? "—"}</p>
                  <p className="mt-2 text-xs opacity-70">
                    Randevu: {selectedAppointment.date} {selectedAppointment.time} • {selectedAppointment.reason ?? "—"}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  className="border border-slate-200 dark:border-slate-800"
                  onClick={onCancelAppointment}
                >
                  Randevu İptal
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/30">
              <p className="text-sm font-semibold">Medya Yükle</p>
              <p className="mt-1 text-xs opacity-70">Röntgen / MR / Reçete / dosya raporları.</p>

              <div className="mt-3 grid gap-2">
                <label className="text-xs font-semibold opacity-80">Tür</label>
                <select
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                  value={uploadKind}
                  onChange={(e) => setUploadKind(e.target.value as MediaKind)}
                >
                  <option value="xray">Röntgen</option>
                  <option value="mr">MR</option>
                  <option value="prescription">Reçete</option>
                  <option value="report">Rapor (dosya)</option>
                  <option value="other">Diğer</option>
                </select>

                <label className="text-xs font-semibold opacity-80">Dosya</label>
                <input type="file" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} className="block w-full text-sm" />
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold">Medyalar</p>
                {patientMedia.length === 0 ? (
                  <p className="mt-2 text-sm opacity-70">Henüz medya yok.</p>
                ) : (
                  <ul className="mt-2 grid gap-2">
                    {patientMedia.map((m) => {
                      const isImage = /\.(png|jpg|jpeg|webp|gif)$/i.test(m.fileName);
                      return (
                        <li key={m.id} className="rounded-xl border border-slate-200 p-2 dark:border-slate-800">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold break-words">{m.fileName}</p>
                              <p className="mt-1 text-xs opacity-80">{kindLabel(m.kind)}</p>
                              <p className="mt-1 text-xs opacity-60">{new Date(m.uploadedAtISO).toLocaleString()}</p>
                            </div>
                            <a href={m.url} target="_blank" rel="noreferrer" className="text-xs underline opacity-80">
                              Aç
                            </a>
                          </div>

                          {isImage ? (
                            <img
                              src={m.url}
                              alt={m.fileName}
                              className="mt-2 max-h-48 w-full rounded-xl border border-slate-200 object-contain dark:border-slate-800"
                            />
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/30">
              <p className="text-sm font-semibold">Raporlar</p>

              <div className="mt-3 grid gap-2">
                <label className="text-xs font-semibold opacity-80">Başlık</label>
                <input
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
                  placeholder="Örn: Muayene Notu"
                />

                <label className="text-xs font-semibold opacity-80">İçerik</label>
                <Textarea value={reportBody} onChange={(e) => setReportBody(e.target.value)} placeholder="Rapor metni..." rows={4} />

                <Button
                  className="bg-slate-900 text-white hover:bg-slate-700"
                  onClick={() => {
                    const t = reportTitle.trim();
                    const b = reportBody.trim();
                    if (!t || !b) {
                      toast("Eksik alan", { description: "Başlık ve içerik gerekli." });
                      return;
                    }
                    onAddReport(t, b);
                    setReportTitle("");
                    setReportBody("");
                  }}
                >
                  + Rapor Ekle
                </Button>
              </div>

              {patientReports.length === 0 ? (
                <p className="mt-3 text-sm opacity-70">Henüz rapor yok.</p>
              ) : (
                <ul className="mt-3 grid gap-2">
                  {patientReports.map((r) => (
                    <li key={r.id} className="rounded-xl border border-slate-200 p-2 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold break-words">{r.title}</p>
                          <p className="mt-1 text-xs opacity-60">{new Date(r.createdAtISO).toLocaleString()}</p>
                        </div>
                        <Button
                          variant="secondary"
                          className="border border-slate-200 dark:border-slate-800"
                          onClick={() => onDeleteReport(r.id)}
                        >
                          Sil
                        </Button>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm opacity-90">{r.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// =====================
// Pager Chat paneli
// =====================

function PagerChatPanel(props: {
  selectedDate: string;
  todayISO: string;
  candidates: Array<{ appt: Appointment; minutes: number }>;
  activeChatApptId: string | null;
  setActiveChatApptId: (id: string | null) => void;
  activeChatAppt: Appointment | null;
  activeChatPatient: Patient | null;
  thread: ChatThread | null;
  canStartChat: boolean;
  onStartChat: () => void;
  onSend: (text: string) => void;
}) {
  const {
    selectedDate,
    todayISO,
    candidates,
    activeChatApptId,
    setActiveChatApptId,
    activeChatAppt,
    activeChatPatient,
    thread,
    canStartChat,
    onStartChat,
    onSend,
  } = props;

  const [text, setText] = React.useState("");
  const endRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread?.messages.length]);

  return (
    <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/40">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="text-base">Pager Chat</CardTitle>
          <CardDescription>Saati yaklaşan hasta ile sohbet başlat.</CardDescription>
        </div>

        <StatusBadge tone={selectedDate === todayISO ? "info" : "neutral"}>
          {selectedDate === todayISO ? "Bugün" : "Bugün değil"}
        </StatusBadge>
      </CardHeader>

      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <label className="text-xs font-semibold opacity-80">Randevu</label>
          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            value={activeChatApptId ?? ""}
            onChange={(e) => setActiveChatApptId(e.target.value || null)}
          >
            <option value="">—</option>
            {candidates.map((c) => (
              <option key={c.appt.id} value={c.appt.id}>
                {c.appt.time} • {c.minutes >= 0 ? `${c.minutes}dk kaldı` : `${Math.abs(c.minutes)}dk geçti`}
              </option>
            ))}
          </select>

          {!activeChatAppt ? (
            <p className="text-sm opacity-70">Bugün için uygun randevu seç.</p>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-2 text-sm dark:border-slate-800 dark:bg-slate-950/30">
              <p className="font-semibold">
                {activeChatPatient?.fullName ?? "—"} • {activeChatAppt.time}
              </p>
              <p className="mt-1 text-xs opacity-70">{activeChatAppt.reason ?? "—"}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {thread?.started ? (
                  <StatusBadge tone="info">Sohbet açık</StatusBadge>
                ) : (
                  <StatusBadge tone={canStartChat ? "warn" : "neutral"}>
                    {canStartChat ? "Yaklaşıyor" : "Başlatma kapalı"}
                  </StatusBadge>
                )}

                <Button
                  className="bg-slate-900 text-white hover:bg-slate-700"
                  disabled={!canStartChat || Boolean(thread?.started)}
                  onClick={onStartChat}
                >
                  Sohbet Başlat
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="h-[280px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/20">
          {!thread?.started ? (
            <p className="p-2 text-sm opacity-70">Sohbet başlatılmadı.</p>
          ) : (
            <ol className="grid gap-2">
              {thread.messages.map((m) => {
                const isDoctor = m.from === "doctor";
                return (
                  <li key={m.id} className={cn("flex items-end gap-2", isDoctor ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm",
                        isDoctor
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-50"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      <p className="mt-1 text-[11px] opacity-70">{m.at}</p>
                    </div>
                  </li>
                );
              })}
              <div ref={endRef} />
            </ol>
          )}
        </div>

        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSend(text);
            setText("");
          }}
        >
          <div className="flex-1">
            <Textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="Mesaj yaz…" />
          </div>
          <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-700" disabled={!thread?.started}>
            Gönder
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
