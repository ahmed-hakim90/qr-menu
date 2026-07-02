"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/dashboard-api";
import { toast } from "sonner";

interface ToggleFieldProps {
  id: string;
  label: string;
  checked: boolean;
  field: string;
  endpoint: string;
  onUpdated: () => void;
}

export function ToggleField({
  id,
  label,
  checked,
  field,
  endpoint,
  onUpdated,
}: ToggleFieldProps) {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(checked);

  const handleToggle = async (next: boolean) => {
    setValue(next);
    setLoading(true);
    try {
      await apiRequest(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ [field]: next }),
      });
      onUpdated();
    } catch {
      setValue(!next);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 px-4 py-3">
      <Label htmlFor={`${id}-${field}`} className="cursor-pointer">
        {label}
      </Label>
      <Switch
        id={`${id}-${field}`}
        checked={value}
        disabled={loading}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

export function RowActions({ onEdit, onDelete }: RowActionsProps) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={deleting}
        onClick={async () => {
          if (!confirm("Are you sure you want to delete this item?")) return;
          setDeleting(true);
          try {
            await onDelete();
          } finally {
            setDeleting(false);
          }
        }}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
