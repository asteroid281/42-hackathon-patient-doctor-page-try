// Date and time utility functions for testing

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return toISODate(dt);
}

function isWeekendISO(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay();
  return day === 0 || day === 6;
}

function isPastISO(iso: string, todayISO: string): boolean {
  return iso < todayISO;
}

function minutesUntil(isoDate: string, hhmm: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  const target = new Date(y, m - 1, d, hh, mm, 0, 0).getTime();
  const now = Date.now();
  return Math.round((target - now) / 60000);
}

export { toISODate, addDays, isWeekendISO, isPastISO, minutesUntil };
