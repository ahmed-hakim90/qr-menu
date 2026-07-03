import { Prisma } from "@/generated/prisma";
import {
  normalizeWorkingHours,
  parseWorkingHours,
  workingHoursToStrings,
} from "@/lib/working-hours";

type BranchPayload = {
  nameAr?: string;
  nameEn?: string;
  addressAr?: string;
  addressEn?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  googleMaps?: string;
  googleReviewUrl?: string;
  reservationPhone?: string;
  hoursAr?: string;
  hoursEn?: string;
  workingHours?: unknown;
  logo?: string;
  coverImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive?: boolean;
};

export function normalizeBranchData(data: BranchPayload): Prisma.BranchUpdateInput {
  const workingHours = parseWorkingHours(data.workingHours);
  const normalizedHours = workingHours ? normalizeWorkingHours(workingHours) : null;
  const derivedHours = normalizedHours ? workingHoursToStrings(normalizedHours) : null;

  const update: Prisma.BranchUpdateInput = {};

  if (data.nameAr !== undefined) update.nameAr = data.nameAr;
  if (data.nameEn !== undefined) update.nameEn = data.nameEn;
  if (data.addressAr !== undefined) update.addressAr = data.addressAr || null;
  if (data.addressEn !== undefined) update.addressEn = data.addressEn || null;
  if (data.latitude !== undefined) update.latitude = data.latitude;
  if (data.longitude !== undefined) update.longitude = data.longitude;
  if (data.phone !== undefined) update.phone = data.phone || null;
  if (data.whatsapp !== undefined) update.whatsapp = data.whatsapp || null;
  if (data.instagram !== undefined) update.instagram = data.instagram || null;
  if (data.facebook !== undefined) update.facebook = data.facebook || null;
  if (data.googleMaps !== undefined) update.googleMaps = data.googleMaps || null;
  if (data.googleReviewUrl !== undefined) update.googleReviewUrl = data.googleReviewUrl || null;
  if (data.reservationPhone !== undefined) update.reservationPhone = data.reservationPhone || null;
  if (data.primaryColor !== undefined) update.primaryColor = data.primaryColor;
  if (data.secondaryColor !== undefined) update.secondaryColor = data.secondaryColor;
  if (data.isActive !== undefined) update.isActive = data.isActive;
  if (data.logo !== undefined) update.logo = data.logo === "" ? null : data.logo;
  if (data.coverImage !== undefined) {
    update.coverImage = data.coverImage === "" ? null : data.coverImage;
  }

  if (normalizedHours) {
    update.workingHours = normalizedHours as unknown as Prisma.InputJsonValue;
    update.hoursAr = derivedHours!.hoursAr;
    update.hoursEn = derivedHours!.hoursEn;
  } else if (data.workingHours !== undefined) {
    update.workingHours =
      data.workingHours === null
        ? Prisma.JsonNull
        : (data.workingHours as Prisma.InputJsonValue);
  }

  if (data.hoursAr !== undefined && !normalizedHours) {
    update.hoursAr = data.hoursAr || null;
  }
  if (data.hoursEn !== undefined && !normalizedHours) {
    update.hoursEn = data.hoursEn || null;
  }

  return update;
}
