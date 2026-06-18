import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  addClassToElement,
  doesElementContainClass,
  getElementById,
  removeClassFromElement,
} from "../../../utils/domManipulation";
import TypesSelector from "../TypesSelector/TypesSelector";
import SearchInput from "../SearchInput/SearchInput";
import ListSortingDropdown from "../ListSortingDropdown/ListSortingDropdown";
import styles from "./NavigationBar.module.css";
import ResolutionToggleSwitch from "../ResolutionToggleSwitch/ResolutionToggleSwitch";
import ThemeToggleSwitch from "../ThemeToggleSwitch/ThemeToggleSwitch";
import { HOME, TYPE_INTERACTIONS } from "../../../constants/Routes";

const DRAWER_ELEMENT_ID = "drawerElementId";
const FILTER_ELEMENT_ID = "filterButtonId";
const SCROLL_HIDE_THRESHOLD = 120;

const NavigationBar = () => {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isTypeChart = router.pathname === TYPE_INTERACTIONS;
  const isHome = router.pathname === HOME;
  const showTypeFilter = !isTypeChart;

  // Hide the bar when scrolling down (past its own height), reveal it the moment
  // the user scrolls back up, and always show it at the top of the page.
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= SCROLL_HIDE_THRESHOLD) {
        setHidden(false);
      } else if (currentScrollY > lastScrollY) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY) {
        setHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile options sheet whenever the route changes.
  useEffect(() => setMenuOpen(false), [router.pathname]);

  const navigateHome = () => router.push(HOME);

  const openDrawer = (drawer: HTMLElement, button: HTMLElement) => {
    addClassToElement(drawer, styles.open);
    addClassToElement(button, styles.filterActive);
  };

  const closeDrawer = (drawer: HTMLElement, button: HTMLElement) => {
    removeClassFromElement(drawer, styles.open);
    removeClassFromElement(button, styles.filterActive);
  };

  const toggleDrawer = () => {
    const drawer = getElementById(DRAWER_ELEMENT_ID);
    const button = getElementById(FILTER_ELEMENT_ID);

    if (!drawer || !button) {
      return;
    }

    return doesElementContainClass(drawer, styles.open) ? closeDrawer(drawer, button) : openDrawer(drawer, button);
  };

  const renderDrawer = () =>
    showTypeFilter ? (
      <div className={[styles.drawer, styles.close].join(" ")} id={DRAWER_ELEMENT_ID}>
        <p>Filter Pokémon by type</p>
        <TypesSelector />
      </div>
    ) : null;

  // The right-hand cluster (sort · theme · resolution). On desktop it sits inline
  // in the bar; on mobile it is rendered inside the slide-up options sheet.
  const renderControls = () => (
    <>
      {isHome && <ListSortingDropdown />}
      <ThemeToggleSwitch />
      <ResolutionToggleSwitch />
    </>
  );

  return (
    <>
      <nav className={`${styles.container} ${hidden ? styles.hidden : ""}`}>
        <div className={styles.bar}>
          <img className={styles.logo} src="/icons/logo.svg" alt="logo" onClick={navigateHome} />

          {/* Desktop-only segmented tabs (mobile uses the bottom tab bar). */}
          <div className={styles.tabs}>
            <Link href={HOME} className={`${styles.tab} ${!isTypeChart ? styles.tabActive : ""}`}>
              Pokédex
            </Link>
            <Link href={TYPE_INTERACTIONS} className={`${styles.tab} ${isTypeChart ? styles.tabActive : ""}`}>
              Type Chart
            </Link>
          </div>

          <div className={styles.searchWrap}>
            <SearchInput />
          </div>

          {/* Desktop-only type-filter funnel (mobile folds this into the sheet). */}
          {showTypeFilter && (
            <button
              type="button"
              id={FILTER_ELEMENT_ID}
              className={styles.filterBtn}
              onClick={toggleDrawer}
              aria-label="Filter by type"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
          )}

          {/* Desktop-only control cluster. */}
          <div className={styles.controls}>{renderControls()}</div>

          {/* Mobile-only overflow menu trigger. */}
          <button
            type="button"
            className={`${styles.menuBtn} ${menuOpen ? styles.menuActive : ""}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Options"
            aria-expanded={menuOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>
        </div>
        {renderDrawer()}
      </nav>

      {/* Mobile-only options sheet: type filter + sort + theme + resolution. */}
      <div
        className={`${styles.sheetOverlay} ${menuOpen ? styles.sheetOpen : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
          <div className={styles.sheetHandle} />
          <div className={styles.sheetControls}>{renderControls()}</div>
          {showTypeFilter && (
            <div className={styles.sheetFilter}>
              <p>Filter Pokémon by type</p>
              <TypesSelector />
            </div>
          )}
        </div>
      </div>

      {/* Mobile-only bottom tab bar. */}
      <nav className={styles.bottomTabs}>
        <Link href={HOME} className={`${styles.bottomTab} ${!isTypeChart ? styles.bottomTabActive : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 10h18" />
          </svg>
          Pokédex
        </Link>
        <Link href={TYPE_INTERACTIONS} className={`${styles.bottomTab} ${isTypeChart ? styles.bottomTabActive : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Type Chart
        </Link>
      </nav>
    </>
  );
};

export default NavigationBar;
