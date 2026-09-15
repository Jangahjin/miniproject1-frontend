import type { Pharmacy } from "./pharmacy";
import type { Medicine } from "./medicine";

export interface PriceReport {
  id: number;
  pharmacyId: number;
  medicineId: number;
  price: number;
  reportedAt: string;
  receiptImageUrl?: string;
}

export interface PriceReportInput {
  pharmacyName: string;
  medicineName: string;
  price: number;
  receiptImage?: File;
}

export interface PharmacyRecommendation {
  pharmacy: Pharmacy;
  medicine: Medicine;
  lowestPrice: number;
  averagePrice: number;
  lastReportedAt: string;
}
