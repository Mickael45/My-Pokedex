import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { updateConsent } from "./consentMode";

describe("updateConsent", () => {
  afterEach(() => {
    // @ts-expect-error cleanup test global
    delete window.gtag;
    vi.restoreAllMocks();
  });

  it("pushes granted for all four Consent Mode v2 keys when granted", () => {
    const gtag = vi.fn();
    // @ts-expect-error test global
    window.gtag = gtag;

    updateConsent(true);

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
  });

  it("pushes denied for all four keys when not granted", () => {
    const gtag = vi.fn();
    // @ts-expect-error test global
    window.gtag = gtag;

    updateConsent(false);

    expect(gtag).toHaveBeenCalledWith("consent", "update", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  });

  it("is a no-op when gtag is unavailable", () => {
    expect(() => updateConsent(true)).not.toThrow();
  });
});
