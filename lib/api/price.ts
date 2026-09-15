import { apiFetch } from "./client";
import type { PharmacyRecommendation, PriceReport, PriceReportInput } from "@/types/price";

export function getRecommendations(params: {
  medicineName: string;
  latitude: number;
  longitude: number;
}): Promise<PharmacyRecommendation[]> {
  const query = new URLSearchParams({
    medicineName: params.medicineName,
    latitude: String(params.latitude),
    longitude: String(params.longitude),
  });

  return apiFetch<PharmacyRecommendation[]>(`/api/recommendations?${query}`);
}

export function submitPriceReport(input: PriceReportInput): Promise<PriceReport> {
  const formData = new FormData();
  formData.append("pharmacyName", input.pharmacyName);
  formData.append("medicineName", input.medicineName);
  formData.append("price", String(input.price));
  if (input.receiptImage) {
    formData.append("receiptImage", input.receiptImage);
  }

  return apiFetch<PriceReport>("/api/price-reports", {
    method: "POST",
    body: formData,
  });
}
