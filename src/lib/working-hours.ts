export const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export interface DayHours {
  closed: boolean;
  open: string;
  close: string;
}

export type WorkingHours = Record<DayKey, DayHours>;

export const DAY_LABELS_EN: Record<DayKey, string> = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

export const DAY_LABELS_AR: Record<DayKey, string> = {
  sun: "الأحد",
  mon: "الإثنين",
  tue: "الثلاثاء",
  wed: "الأربعاء",
  thu: "الخميس",
  fri: "الجمعة",
  sat: "السبت",
};

const DEFAULT_DAY: DayHours = { closed: false, open: "09:00", close: "22:00" };

/** Normalize browser/DB time strings to HH:MM for validation and storage. */
export function normalizeTimeValue(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return trimmed;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return trimmed;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function normalizeDayHours(day: DayHours): DayHours {
  return {
    closed: day.closed,
    open: normalizeTimeValue(day.open),
    close: normalizeTimeValue(day.close),
  };
}

export function normalizeWorkingHours(hours: WorkingHours): WorkingHours {
  return Object.fromEntries(
    DAY_KEYS.map((day) => [day, normalizeDayHours(hours[day])])
  ) as WorkingHours;
}

export function defaultWorkingHours(): WorkingHours {
  return {
    sun: { ...DEFAULT_DAY },
    mon: { ...DEFAULT_DAY },
    tue: { ...DEFAULT_DAY },
    wed: { ...DEFAULT_DAY },
    thu: { ...DEFAULT_DAY },
    fri: { closed: true, open: "09:00", close: "22:00" },
    sat: { ...DEFAULT_DAY, open: "10:00", close: "23:00" },
  };
}

function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatTimeAr(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "م" : "ص";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function groupConsecutiveDays(
  hours: WorkingHours,
  labels: Record<DayKey, string>
): string[] {
  const segments: string[] = [];
  let i = 0;

  while (i < DAY_KEYS.length) {
    const key = DAY_KEYS[i];
    const current = hours[key];
    let j = i + 1;

    while (j < DAY_KEYS.length) {
      const next = hours[DAY_KEYS[j]];
      if (
        next.closed !== current.closed ||
        (!current.closed && (next.open !== current.open || next.close !== current.close))
      ) {
        break;
      }
      j += 1;
    }

    const dayRange =
      j - i === 1
        ? labels[key]
        : `${labels[DAY_KEYS[i]]} - ${labels[DAY_KEYS[j - 1]]}`;

    if (current.closed) {
      segments.push(`${dayRange}: Closed`);
    } else {
      segments.push(`${dayRange}: ${formatTime12h(current.open)} - ${formatTime12h(current.close)}`);
    }

    i = j;
  }

  return segments;
}

function groupConsecutiveDaysAr(hours: WorkingHours): string[] {
  const segments: string[] = [];
  let i = 0;

  while (i < DAY_KEYS.length) {
    const key = DAY_KEYS[i];
    const current = hours[key];
    let j = i + 1;

    while (j < DAY_KEYS.length) {
      const next = hours[DAY_KEYS[j]];
      if (
        next.closed !== current.closed ||
        (!current.closed && (next.open !== current.open || next.close !== current.close))
      ) {
        break;
      }
      j += 1;
    }

    const dayRange =
      j - i === 1
        ? DAY_LABELS_AR[key]
        : `${DAY_LABELS_AR[DAY_KEYS[i]]} - ${DAY_LABELS_AR[DAY_KEYS[j - 1]]}`;

    if (current.closed) {
      segments.push(`${dayRange}: مغلق`);
    } else {
      segments.push(
        `${dayRange}: ${formatTimeAr(current.open)} - ${formatTimeAr(current.close)}`
      );
    }

    i = j;
  }

  return segments;
}

export function workingHoursToStrings(hours: WorkingHours): { hoursEn: string; hoursAr: string } {
  return {
    hoursEn: groupConsecutiveDays(hours, DAY_LABELS_EN).join(" | "),
    hoursAr: groupConsecutiveDaysAr(hours).join(" | "),
  };
}

export function parseWorkingHours(value: unknown): WorkingHours | null {
  if (!value || typeof value !== "object") return null;

  const parsed = value as Partial<Record<DayKey, Partial<DayHours>>>;
  const result = defaultWorkingHours();

  for (const key of DAY_KEYS) {
    const day = parsed[key];
    if (!day) continue;
    result[key] = normalizeDayHours({
      closed: Boolean(day.closed),
      open: typeof day.open === "string" ? day.open : result[key].open,
      close: typeof day.close === "string" ? day.close : result[key].close,
    });
  }

  return result;
}

export function isOpenNow(hours: WorkingHours, date = new Date()): boolean {
  const dayIndex = date.getDay();
  const key = DAY_KEYS[dayIndex];
  const day = hours[key];
  if (day.closed) return false;

  const [openH, openM] = day.open.split(":").map(Number);
  const [closeH, closeM] = day.close.split(":").map(Number);
  const now = date.getHours() * 60 + date.getMinutes();
  const open = openH * 60 + openM;
  const close = closeH * 60 + closeM;

  if (close <= open) {
    return now >= open || now < close;
  }

  return now >= open && now < close;
}
