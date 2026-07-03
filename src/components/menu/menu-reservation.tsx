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
}

export function MenuReservation({
  branchSlug,
  locale,
  labels,
  reservationPhone,
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

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center gap-2 p-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
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
          <Button variant="outline" asChild>
            <a href={`tel:${reservationPhone}`}>
              {labels.callToReserve}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
