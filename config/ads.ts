// Master switch for AdSense. Flip to `true` AND assign each slot a real ad-unit
// id (created in the AdSense console) to start serving ads. Until then every
// <AdSlot> renders a reserved-height placeholder, so enabling causes zero CLS.
// See docs/superpowers/plans — "Owner runbook: enabling ads" before flipping.
export const ADS_ENABLED = false;

export const ADSENSE_CLIENT = "ca-pub-3950888851778991";

export interface AdSlotConfig {
  // AdSense ad-unit slot id; empty until the unit is created in the console.
  slot: string;
  // Reserved box height in px (CLS protection — must match the unit's size).
  height: number;
}

export const AD_SLOTS = {
  detailBelowStats: { slot: "", height: 280 },
  typeChartBelowIntro: { slot: "", height: 280 },
  homeInGrid: { slot: "", height: 280 },
} as const satisfies Record<string, AdSlotConfig>;

export type AdSlotName = keyof typeof AD_SLOTS;
