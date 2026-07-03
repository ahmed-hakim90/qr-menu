"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { MenuThemeSlug } from "@/lib/menu-themes";

interface MenuReservationProps {
  branchSlug: string;
  locale: string;
  labels: {
    book: string;
    title: string;
    name: string;
    phone: string;
    partySize: string;
    dateTime: string;
    notes: string;
    submit: string;
    submitting: string;
    success: string;
    callToReserve: string;
  };
  reservationPhone?: string | null;
  menuTheme?: MenuThemeSlug;
}

export function MenuReservation({
  branchSlug,
  locale,
  labels,
  reservationPhone,
  menuTheme = "classic",
}: MenuReservationProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    partySize: "2",
    startsAt: "",
    notes: "",
  });

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm({
      customerName: "",
      customerPhone: "",
      partySize: "2",
      startsAt: "",
      notes: "",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchSlug,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          partySize: Number(form.partySize),
          startsAt: new Date(form.startsAt).toISOString(),
          notes: form.notes || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : locale === "ar"
              ? "تعذر إرسال طلب الحجز"
              : "Failed to submit reservation"
        );
      }

      toast.success(labels.success);
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const isAntika = menuTheme === "antika";
  const isBistro = menuTheme === "bistro";
  const buttonClass = isAntika
    ? "h-9 border-[#d7c7b2] bg-[#fffaf1] text-xs text-[#2a160f] hover:bg-[#f0dfc4] sm:text-sm"
    : isBistro
      ? "h-9 border-[#c9a84c]/30 bg-[#1c1915] text-xs text-[#f5f0e8] hover:bg-[#252018] hover:text-[#f5f0e8] sm:text-sm"
      : "h-9 text-xs sm:text-sm";

  return (
    <div className="flex flex-wrap gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className={cn("gap-2", buttonClass)}>
            <CalendarDays className="h-4 w-4" />
            {labels.book}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{labels.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reservation-name">{labels.name}</Label>
              <Input
                id="reservation-name"
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservation-phone">{labels.phone}</Label>
              <Input
                id="reservation-phone"
                type="tel"
                inputMode="tel"
                value={form.customerPhone}
                onChange={(e) => set("customerPhone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservation-party">{labels.partySize}</Label>
              <Input
                id="reservation-party"
                type="number"
                min={1}
                value={form.partySize}
                onChange={(e) => set("partySize", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservation-datetime">{labels.dateTime}</Label>
              <Input
                id="reservation-datetime"
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => set("startsAt", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservation-notes">{labels.notes}</Label>
              <Textarea
                id="reservation-notes"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? labels.submitting : labels.submit}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {reservationPhone && (
        <Button variant="outline" className={buttonClass} asChild>
          <a href={`tel:${reservationPhone}`}>{labels.callToReserve}</a>
        </Button>
      )}
    </div>
  );
}
