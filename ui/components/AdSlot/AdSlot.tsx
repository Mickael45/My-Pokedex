import { useEffect } from "react";
import { ADS_ENABLED, ADSENSE_CLIENT, AD_SLOTS, AdSlotName } from "../../../config/ads";
import styles from "./AdSlot.module.css";

interface IProps {
  name: AdSlotName;
}

// Renders nothing while ads are disabled, so it adds no visible gap to the page.
// CLS reservation only matters once ads actually load, so it kicks in only when
// ADS_ENABLED is true: an unconfigured slot reserves height (dev preview), and a
// configured slot renders the live <ins> with the same reserved height.
const AdSlot = ({ name }: IProps) => {
  const { slot, height } = AD_SLOTS[name];
  const active = ADS_ENABLED && slot !== "";

  useEffect(() => {
    if (!active) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // loader not present yet — no-op
    }
  }, [active]);

  // Ads off entirely: render nothing (no reserved blank space in the layout).
  if (!ADS_ENABLED) {
    return null;
  }

  if (!active) {
    return (
      <div
        className={styles.placeholder}
        style={{ minHeight: height }}
        data-ad-slot={name}
        aria-hidden="true"
      />
    );
  }

  return (
    <ins
      className={`adsbygoogle ${styles.unit}`}
      style={{ display: "block", minHeight: height }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdSlot;
