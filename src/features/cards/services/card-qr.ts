import QRCode from "qrcode";
import { buildScanUrl } from "./card-token";

export async function generateQrImageDataUrl(scanUrl: string): Promise<string> {
  return QRCode.toDataURL(scanUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export async function generateQrForToken(
  scanBaseUrl: string,
  token: string
): Promise<string> {
  const url = buildScanUrl(scanBaseUrl, token);
  return generateQrImageDataUrl(url);
}
