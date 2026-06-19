import { useEffect } from "react";
import { ADS_ENABLED, ADSENSE_CLIENT, AD_SLOTS, AdSlotName } from "../../../config/ads";
import styles from "./AdSlot.module.css";

interface IProps {
  name: AdSlotName;
}

// CLS-safe: reserves `height` at all times. Renders a live <ins> ad unit only
// when ads are enabled AND the slot has a real id; otherwise an empty reserved box.
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
