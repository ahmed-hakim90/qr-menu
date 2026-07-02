"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DAY_KEYS,
  DAY_LABELS_AR,
  DAY_LABELS_EN,
  type DayKey,
  type WorkingHours,
} from "@/lib/working-hours";

interface WorkingHoursEditorProps {
  value: WorkingHours;
  onChange: (value: WorkingHours) => void;
}

export function WorkingHoursEditor({ value, onChange }: WorkingHoursEditorProps) {
  const updateDay = (day: DayKey, patch: Partial<WorkingHours[DayKey]>) => {
    onChange({
      ...value,
      [day]: { ...value[day], ...patch },
    });
  };

  return (
    <div className="space-y-3">
      <Label>Working Hours</Label>
      <div className="rounded-2xl border border-border/50 divide-y divide-border/50 overflow-hidden">
        {DAY_KEYS.map((day) => (
          <div
            key={day}
            className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-4 py-3 bg-background/50"
          >
            <div>
              <p className="text-sm font-medium">{DAY_LABELS_EN[day]}</p>
              <p className="text-xs text-muted-foreground">{DAY_LABELS_AR[day]}</p>
            </div>
            <label className="flex items-center gap-2 text-sm sm:justify-end">
              <Switch
                checked={!value[day].closed}
                onCheckedChange={(open) => updateDay(day, { closed: !open })}
              />
              {value[day].closed ? "Closed" : "Open"}
            </label>
            <Input
              type="time"
              value={value[day].open}
              disabled={value[day].closed}
              onChange={(e) => updateDay(day, { open: e.target.value })}
              className="h-10"
            />
            <Input
              type="time"
              value={value[day].close}
              disabled={value[day].closed}
              onChange={(e) => updateDay(day, { close: e.target.value })}
              className="h-10"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
