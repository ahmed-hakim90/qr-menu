"use client";

import { useState } from "react";
import { useDeferredEffect } from "@/hooks/use-deferred-effect";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/dashboard-api";

type Branch = { id: string; nameEn: string };
type Table = { id: string; name: string };
type Reservation = {
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  startsAt: string;
  status: string;
  table?: { name: string } | null;
};

interface ReservationsManagerProps {
  branches: Branch[];
  tables: Table[];
}

export function ReservationsManager({ branches, tables }: ReservationsManagerProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [form, setForm] = useState({
    branchId: branches[0]?.id ?? "",
    tableId: "",
    customerName: "",
    customerPhone: "",
    partySize: "2",
    startsAt: "",
    notes: "",
  });

  const load = async () => {
    const data = await apiRequest<Reservation[]>("/api/reservations");
    setReservations(data);
  };

  useDeferredEffect(() => {
    load().catch((error) => toast.error(error.message));
  }, []);

  const createReservation = async (event: React.FormEvent) => {
    event.preventDefault();
    await apiRequest("/api/reservations", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        partySize: Number(form.partySize),
        startsAt: new Date(form.startsAt).toISOString(),
        tableId: form.tableId || undefined,
      }),
    });
    setForm({
      branchId: branches[0]?.id ?? "",
      tableId: "",
      customerName: "",
      customerPhone: "",
      partySize: "2",
      startsAt: "",
      notes: "",
    });
    await load();
    toast.success("Reservation created");
  };

  const updateStatus = async (id: string, status: string) => {
    await apiRequest(`/api/reservations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await load();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={createReservation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select
                value={form.branchId}
                onChange={(event) => setForm({ ...form, branchId: event.target.value })}
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.nameEn}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Table</Label>
              <Select
                value={form.tableId}
                onChange={(event) => setForm({ ...form, tableId: event.target.value })}
              >
                <option value="">Any</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Customer name</Label>
              <Input
                value={form.customerName}
                onChange={(event) => setForm({ ...form, customerName: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={form.customerPhone}
                onChange={(event) => setForm({ ...form, customerPhone: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Party size</Label>
              <Input
                type="number"
                min={1}
                value={form.partySize}
                onChange={(event) => setForm({ ...form, partySize: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Starts at</Label>
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => setForm({ ...form, startsAt: event.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">
                <Plus className="h-4 w-4" />
                Create Reservation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{reservation.customerName}</h3>
                  <p className="text-sm text-muted-foreground">{reservation.customerPhone}</p>
                </div>
                <Badge>{reservation.status}</Badge>
              </div>
              <p className="text-sm">
                {reservation.partySize} guests · {new Date(reservation.startsAt).toLocaleString()}
              </p>
              {reservation.table && (
                <p className="text-sm text-muted-foreground">{reservation.table.name}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {["CONFIRMED", "SEATED", "CANCELLED"].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(reservation.id, status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
