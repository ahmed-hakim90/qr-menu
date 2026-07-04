import type { CardStatus, CardType, NfcWriteStatus, PrintQueueStatus, PrintSheetType } from "@/generated/prisma";

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  AVAILABLE: "Available",
  ASSIGNED: "Assigned",
  INACTIVE: "Inactive",
  LOST: "Lost",
  BROKEN: "Broken",
  DISABLED: "Disabled",
  ARCHIVED: "Archived",
};

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  QR_ONLY: "QR Only",
  NFC_ONLY: "NFC Only",
  QR_AND_NFC: "QR + NFC",
  TABLE_STAND: "Table Stand",
  TABLE_STICKER: "Table Sticker",
  ACRYLIC_STAND: "Acrylic Stand",
  TENT_CARD: "Tent Card",
};

export const NFC_WRITE_STATUS_LABELS: Record<NfcWriteStatus, string> = {
  PENDING: "Pending",
  WRITTEN: "Written",
  FAILED: "Failed",
  NOT_APPLICABLE: "N/A",
};

export const PRINT_SHEET_LABELS: Record<PrintSheetType, string> = {
  A4: "A4 Printable Sheets",
  LABEL_SHEET: "Label Sheets",
  STICKER_SHEET: "Sticker Sheets",
  PVC_CARD: "PVC Cards",
  ACRYLIC_STAND: "Acrylic Stands",
  TABLE_TENT: "Table Tents",
};

export const PRINT_QUEUE_STATUS_LABELS: Record<PrintQueueStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function statusBadgeVariant(status: CardStatus) {
  switch (status) {
    case "AVAILABLE":
      return "success" as const;
    case "ASSIGNED":
      return "default" as const;
    case "DISABLED":
    case "LOST":
    case "BROKEN":
      return "destructive" as const;
    case "INACTIVE":
    case "ARCHIVED":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleString();
}

export function exportToCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
