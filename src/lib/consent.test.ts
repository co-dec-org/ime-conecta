import { describe, it, expect, beforeEach } from "vitest";
import {
  recordConsent,
  hasConsent,
  consentHistory,
  clearConsents,
  POLICY_VERSION,
} from "./consent";

beforeEach(() => clearConsents());

describe("consent", () => {
  it("sin consentimiento por defecto", () => {
    expect(hasConsent("tracking")).toBe(false);
    expect(hasConsent("account")).toBe(false);
  });

  it("refleja el último estado otorgado/revocado", () => {
    recordConsent("tracking", true);
    expect(hasConsent("tracking")).toBe(true);
    recordConsent("tracking", false);
    expect(hasConsent("tracking")).toBe(false);
  });

  it("guarda historial auditable con versión y marca de tiempo", () => {
    recordConsent("account", true);
    recordConsent("tracking", true);
    const h = consentHistory();
    expect(h.length).toBe(2);
    expect(h[0].policyVersion).toBe(POLICY_VERSION);
    expect(h[0].at).toBeTruthy();
  });

  it("scopes son independientes", () => {
    recordConsent("account", true);
    expect(hasConsent("account")).toBe(true);
    expect(hasConsent("tracking")).toBe(false);
  });
});
