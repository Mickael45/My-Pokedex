import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/react";

afterEach(() => vi.resetModules());

describe("AdSlot (ads disabled — default)", () => {
  it("renders nothing — no reserved gap, no ad unit", async () => {
    const { default: AdSlot } = await import("./AdSlot");
    const { container } = render(<AdSlot name="detailBelowStats" />);

    // Disabled ads must not add any visible box to the layout.
    expect(container).toBeEmptyDOMElement();
    expect(container.querySelector('[data-ad-slot="detailBelowStats"]')).toBeNull();
    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
  });
});

describe("AdSlot (ads enabled but slot unconfigured)", () => {
  it("reserves height with a placeholder, not a live ad unit", async () => {
    vi.doMock("../../../config/ads", () => ({
      ADS_ENABLED: true,
      ADSENSE_CLIENT: "ca-pub-3950888851778991",
      AD_SLOTS: { detailBelowStats: { slot: "", height: 280 } },
    }));

    const { default: AdSlot } = await import("./AdSlot");
    const { container } = render(<AdSlot name={"detailBelowStats" as never} />);

    const placeholder = container.querySelector('[data-ad-slot="detailBelowStats"]');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveStyle({ minHeight: "280px" });
    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
  });
});

describe("AdSlot (ads enabled + slot id)", () => {
  it("renders a real adsbygoogle ins unit with the publisher id", async () => {
    vi.doMock("../../../config/ads", () => ({
      ADS_ENABLED: true,
      ADSENSE_CLIENT: "ca-pub-3950888851778991",
      AD_SLOTS: { detailBelowStats: { slot: "1234567890", height: 280 } },
    }));
    window.adsbygoogle = [];

    const { default: AdSlot } = await import("./AdSlot");
    const { container } = render(<AdSlot name={"detailBelowStats" as never} />);

    const ins = container.querySelector("ins.adsbygoogle");
    expect(ins).toBeInTheDocument();
    expect(ins).toHaveAttribute("data-ad-client", "ca-pub-3950888851778991");
    expect(ins).toHaveAttribute("data-ad-slot", "1234567890");
  });
});
