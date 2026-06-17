import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
import BanneredButton from "../BanneredButton/BanneredButton";
import { HOME, TYPE_INTERACTIONS } from "../../../constants/Routes";

const DRAWER_ELEMENT_ID = "drawerElementId";
const ARROW_ELEMENT_ID = "arrowElementId";
const SCROLL_HIDE_THRESHOLD = 120;

const NavigationBar = () => {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);

  const isHome = router.pathname === HOME;
  const showTypeFilter = router.pathname !== TYPE_INTERACTIONS;

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

  const navigateHome = () => router.push(HOME);

  const openDrawer = (drawer: HTMLElement, arrow: HTMLElement) => {
    addClassToElement(drawer, styles.open);
    addClassToElement(arrow, styles.up);
  };

  const closeDrawer = (drawer: HTMLElement, arrow: HTMLElement) => {
    removeClassFromElement(drawer, styles.open);
    removeClassFromElement(arrow, styles.up);
  };

  const toggleDrawer = () => {
    const drawer = getElementById(DRAWER_ELEMENT_ID);
    const arrow = getElementById(ARROW_ELEMENT_ID);

    if (!drawer || !arrow) {
      return;
    }

    return doesElementContainClass(drawer, styles.open) ? closeDrawer(drawer, arrow) : openDrawer(drawer, arrow);
  };

  const renderDrawer = () =>
    showTypeFilter ? (
      <div className={[styles.drawer, styles.close].join(" ")} id={DRAWER_ELEMENT_ID}>
        <p>Filter Pokemons by type:</p>
        <TypesSelector />
        <BanneredButton>Type Interactions</BanneredButton>
      </div>
    ) : null;

  return (
    <nav className={`${styles.container} ${hidden ? styles.hidden : ""}`}>
      <div className={styles.bar}>
        <img className={styles.logo} src="/icons/logo.svg" alt="logo" onClick={navigateHome} />
        <div className={styles.searchWrap}>
          <SearchInput />
        </div>
        {showTypeFilter && (
          <div className={styles.arrowWrap}>
            <div className={styles.arrow} id={ARROW_ELEMENT_ID} onClick={toggleDrawer} />
          </div>
        )}
        <div className={styles.controls}>
          {isHome && <ListSortingDropdown />}
          <ThemeToggleSwitch />
          <ResolutionToggleSwitch />
        </div>
      </div>
      {renderDrawer()}
    </nav>
  );
};

export default NavigationBar;
