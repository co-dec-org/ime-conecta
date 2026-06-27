import { describe, it, expect, beforeEach } from "vitest";
import { TraceClient, LocalTraceAdapter } from "./traces";
import { recordConsent, clearConsents } from "./consent";

beforeEach(() => {
  clearConsents();
  window.localStorage.clear();
});

describe("TraceClient", () => {
  it("NO captura sin consentimiento de tracking (cumplimiento por diseño)", async () => {
    const c = new TraceClient(new LocalTraceAdapter());
    const ok = await c.capture("portada", "view");
    expect(ok).toBe(false);
    expect((await c.export()).length).toBe(0);
  });

  it("captura con consentimiento y exporta la traza", async () => {
    recordConsent("tracking", true);
    const c = new TraceClient(new LocalTraceAdapter());
    const ok = await c.capture("gobernanza", "dwell", 5000);
    expect(ok).toBe(true);
    const ev = await c.export();
    expect(ev.length).toBe(1);
    expect(ev[0].asset).toBe("gobernanza");
    expect(ev[0].eventType).toBe("dwell");
    expect(ev[0].dwellMs).toBe(5000);
    expect(ev[0].at).toBeTruthy();
  });

  it("erase limpia todas las trazas (derecho de supresión)", async () => {
    recordConsent("tracking", true);
    const c = new TraceClient();
    await c.capture("datos", "view");
    await c.capture("sercotec", "click");
    expect((await c.export()).length).toBe(2);
    await c.erase();
    expect((await c.export()).length).toBe(0);
  });

  it("deja de capturar tras revocar el consentimiento", async () => {
    recordConsent("tracking", true);
    const c = new TraceClient();
    await c.capture("portada", "view");
    recordConsent("tracking", false);
    const ok = await c.capture("portada", "view");
    expect(ok).toBe(false);
    expect((await c.export()).length).toBe(1);
  });
});
