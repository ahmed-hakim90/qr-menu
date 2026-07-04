"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  type DataTableColumn,
} from "@/components/ui/data-table";
import { formatDate } from "@/features/cards/card-labels";

type ScanLogRow = {
  id: string;
  token: string;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  language: string | null;
  referrer: string | null;
  responseTime: number | null;
  scannedAt: string;
  card: { serialNumber: string; token: string };
  restaurant: { nameEn: string } | null;
  branch: { nameEn: string } | null;
  table: { number: number; name: string } | null;
};

export function ScanLogsManager() {
  const [items, setItems] = useState<ScanLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/cards/scan-logs?${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
  }, [page, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns: DataTableColumn<ScanLogRow>[] = [
    { key: "time", header: "Timestamp", cell: (r) => formatDate(r.scannedAt) },
    { key: "restaurant", header: "Restaurant", cell: (r) => r.restaurant?.nameEn ?? "—" },
    { key: "branch", header: "Branch", cell: (r) => r.branch?.nameEn ?? "—" },
    { key: "table", header: "Table", cell: (r) => (r.table ? `#${r.table.number}` : "—") },
    { key: "token", header: "Token", cell: (r) => <span className="font-mono text-xs">{r.token}</span> },
    { key: "device", header: "Device", cell: (r) => r.device ?? "—" },
    { key: "os", header: "OS", cell: (r) => r.os ?? "—" },
    { key: "browser", header: "Browser", cell: (r) => r.browser ?? "—" },
    { key: "country", header: "Country", cell: (r) => r.country ?? "—" },
    { key: "city", header: "City", cell: (r) => r.city ?? "—" },
    { key: "language", header: "Language", cell: (r) => r.language ?? "—" },
    { key: "referrer", header: "Referrer", cell: (r) => r.referrer ? <span className="text-xs truncate max-w-32 block">{r.referrer}</span> : "—" },
    { key: "response", header: "Response", cell: (r) => r.responseTime != null ? `${r.responseTime}ms` : "—" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scan Logs</h1>
        <p className="text-sm text-muted-foreground">Every QR/NFC scan with device and location metadata</p>
      </div>

      <DataTableToolbar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search token, device, browser…" />

      <DataTable columns={columns} data={items} getRowId={(r) => r.id} />
      <DataTablePagination page={page} total={total} limit={limit} onPageChange={setPage} />
    </div>
  );
}
