import { describe, it, expect, vi, afterEach } from "vitest";
import { updateConsent } from "./consentMode";

describe("updateConsent", () => {
  afterEach(() => {
    delete window.gtag;
    vi.restoreAllMocks();
  });

  it("pushes granted analytics_storage when granted", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    updateConsent(true);

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "granted",
    });
  });

  it("pushes denied analytics_storage when not granted", () => {
    const gtag = vi.fn();
    window.gtag = gtag;

    updateConsent(false);

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      analytics_storage: "denied",
    });
  });

  it("is a no-op when gtag is unavailable", () => {
    expect(() => updateConsent(true)).not.toThrow();
  });
});
