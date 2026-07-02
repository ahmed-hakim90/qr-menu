import { describe, expect, it } from "vitest";
import { hasPermission } from "./auth";

describe("hasPermission", () => {
  it("allows higher roles to access lower-role requirements", () => {
    expect(hasPermission("OWNER", ["MANAGER"])).toBe(true);
    expect(hasPermission("MANAGER", ["CAPTAIN"])).toBe(true);
    expect(hasPermission("CAPTAIN", ["CASHIER"])).toBe(true);
  });

  it("denies lower roles for higher-role requirements", () => {
    expect(hasPermission("VIEWER", ["MANAGER"])).toBe(false);
    expect(hasPermission("CASHIER", ["CAPTAIN"])).toBe(false);
    expect(hasPermission("CAPTAIN", ["MANAGER"])).toBe(false);
  });

  it("allows exact role matches", () => {
    expect(hasPermission("CASHIER", ["CASHIER"])).toBe(true);
    expect(hasPermission("CAPTAIN", ["CAPTAIN"])).toBe(true);
  });
});
