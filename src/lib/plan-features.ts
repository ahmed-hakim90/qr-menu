import type { Plan } from "@/generated/prisma";

export type PlanFeature = "tables" | "ordering";

export type PlanFeatureSet = Pick<Plan, "hasTables" | "hasOrdering" | "customDomain">;

export function isMenuOnlyPlan(plan: Pick<Plan, "hasTables" | "hasOrdering">) {
  return !plan.hasTables && !plan.hasOrdering;
}

export function planHasFeature(
  plan: Pick<Plan, "hasTables" | "hasOrdering">,
  feature: PlanFeature
) {
  switch (feature) {
    case "tables":
      return plan.hasTables;
    case "ordering":
      return plan.hasOrdering;
    default:
      return false;
  }
}

export function getPlanFeatureLabels(plan: Pick<Plan, "hasTables" | "hasOrdering">) {
  if (isMenuOnlyPlan(plan)) {
    return {
      en: "Digital menu only",
      ar: "منيو رقمي فقط",
    };
  }

  const features: string[] = ["Digital menu"];
  const featuresAr: string[] = ["منيو رقمي"];

  if (plan.hasTables) {
    features.push("Table QR codes");
    featuresAr.push("ترابيزات");
  }
  if (plan.hasOrdering) {
    features.push("Table ordering");
    featuresAr.push("طلبات من الترابيزة");
  }

  return {
    en: features.join(" + "),
    ar: featuresAr.join(" + "),
  };
}
