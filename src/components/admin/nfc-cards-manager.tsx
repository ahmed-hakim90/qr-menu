"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table";
import {
  CARD_STATUS_LABELS,
  NFC_WRITE_STATUS_LABELS,
  formatDate,
  statusBadgeVariant,
} from "@/features/cards/card-labels";
import type { CardStatus, NfcWriteStatus } from "@/generated/prisma";

type NfcRow = {
  id: string;
  serialNumber: string;
  token: string;
  nfcUid: string | null;
  status: CardStatus;
  nfcWriteStatus: NfcWriteStatus;
  readCount: number;
  scanCount: number;
  lastScanAt: string | null;
  assignments: {
    restaurant: { nameEn: string };
    table: { number: number };
  }[];
};

export function NfcCardsManager() {
  const [items, setItems] = useState<NfcRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 20;

  const fetchCards = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), nfcOnly: "true" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/cards?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
  }, [page, search]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const columns: DataTableColumn<NfcRow>[] = [
    { key: "serial", header: "Serial", cell: (r) => <span className="font-mono text-xs">{r.serialNumber}</span> },
    { key: "token", header: "Token", cell: (r) => <span className="font-mono text-xs">{r.token}</span> },
    { key: "uid", header: "UID", cell: (r) => r.nfcUid ? <span className="font-mono text-xs">{r.nfcUid}</span> : "—" },
    { key: "status", header: "Status", cell: (r) => <Badge variant={statusBadgeVariant(r.status)}>{CARD_STATUS_LABELS[r.status]}</Badge> },
    { key: "restaurant", header: "Restaurant", cell: (r) => r.assignments[0]?.restaurant.nameEn ?? "—" },
    { key: "table", header: "Table", cell: (r) => r.assignments[0] ? `#${r.assignments[0].table.number}` : "—" },
    { key: "write", header: "Write Status", cell: (r) => NFC_WRITE_STATUS_LABELS[r.nfcWriteStatus] },
    { key: "reads", header: "Read Count", cell: (r) => r.readCount },
    { key: "scans", header: "Scans", cell: (r) => r.scanCount },
    { key: "last", header: "Last Scan", cell: (r) => formatDate(r.lastScanAt) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">NFC Cards</h1>
        <p className="text-sm text-muted-foreground">NFC-enabled cards with write status and read counts</p>
      </div>

      <DataTableToolbar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search serial, token, UID…" />

      {items.length === 0 && !search ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No NFC cards yet. Generate QR + NFC or NFC-only cards from Bulk Generator.</CardContent></Card>
      ) : (
        <>
          <DataTable columns={columns} data={items} getRowId={(r) => r.id} />
          <DataTablePagination page={page} total={total} limit={limit} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
