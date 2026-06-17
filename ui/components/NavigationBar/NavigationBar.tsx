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

  // Hide the bar when scrolling down (past the bar's own height), reveal it the
  // moment the user scrolls back up, and always show it at the top of the page.
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

  const renderArrow = () => (
    <div>
      <div className={styles.arrow} id={ARROW_ELEMENT_ID} onClick={toggleDrawer} />
    </div>
  );

  const renderTypeSelector = () =>
    router.pathname !== TYPE_INTERACTIONS ? (
      <>
        <div className={[styles.drawer, styles.close].join(" ")} id={DRAWER_ELEMENT_ID}>
          <p>Filter Pokemons by type:</p>
          <TypesSelector />
          <BanneredButton>Type Interactions</BanneredButton>
        </div>
        {renderArrow()}
      </>
    ) : null;

  return (
    <nav className={`${styles.container} ${hidden ? styles.hidden : ""}`}>
      <img src="/icons/logo.svg" alt="logo" onClick={navigateHome} />
      <div>
        <SearchInput />
        {renderTypeSelector()}
      </div>
      <ThemeToggleSwitch />
      <ResolutionToggleSwitch />
    </nav>
  );
};

export default NavigationBar;
