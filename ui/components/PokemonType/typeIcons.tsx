// White type glyphs for the icon-style filter chips. Each entry is raw inner
// SVG using `currentColor`, so the chip's text colour (white) drives them.
// Filled shapes use fill="currentColor"; outlined shapes use stroke="currentColor".
const STROKE = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

const ICON_MARKUP: Record<string, string> = {
  normal: `<circle cx="12" cy="12" r="7" ${STROKE}/>`,
  fire: `<path fill="currentColor" d="M12 2c2 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3.5 2.5-4.5C9.5 9 11 9 11.5 7.5 12.5 6 12 4 12 2z"/>`,
  water: `<path fill="currentColor" d="M12 3c3 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-6.5 6-11z"/>`,
  grass: `<path fill="currentColor" d="M5 19c0-8 6-13 14-14 1 8-4 15-14 14z"/>`,
  electric: `<path fill="currentColor" d="M13 2 4 14h6l-1 8 9-12h-6z"/>`,
  ice: `<path ${STROKE} d="M12 2v20M3.5 7l17 10M20.5 7l-17 10"/>`,
  rock: `<path fill="currentColor" d="m12 3 8 6-3 10H7L4 9z"/>`,
  fighting: `<rect x="6" y="9" width="12" height="9" rx="3" ${STROKE}/><path ${STROKE} d="M9 9V6.5M12 9V5.5M15 9V6.5"/>`,
  poison: `<circle cx="12" cy="10" r="6" ${STROKE}/><circle cx="9.6" cy="10" r="1.3" fill="currentColor"/><circle cx="14.4" cy="10" r="1.3" fill="currentColor"/><path ${STROKE} d="M9.5 17.5h5"/>`,
  ground: `<path ${STROKE} d="M3 17c4-7 8-7 9-3 1-5 5-7 9-2M3 20h18"/>`,
  flying: `<path fill="currentColor" d="M3 20c8 0 16-6 18-16-9 1-15 6-18 16z"/>`,
  psychic: `<path ${STROKE} d="M14 6a6 6 0 1 0 4 8c1-3-1-6-4-6s-4 2-3 4 3 2 4 0"/>`,
  bug: `<circle cx="12" cy="13" r="5" ${STROKE}/><path ${STROKE} d="M12 8V4M9 5 7.5 3M15 5l1.5-2M7 13H3M21 13h-4M8 17l-3 3M16 17l3 3"/>`,
  ghost: `<path ${STROKE} d="M6 20V11a6 6 0 0 1 12 0v9l-2-2-2 2-2-2-2 2-2-2z"/><circle cx="10" cy="11" r="1" fill="currentColor"/><circle cx="14" cy="11" r="1" fill="currentColor"/>`,
  dark: `<path fill="currentColor" d="M17 3a8 8 0 1 0 4.5 14.5A7 7 0 0 1 17 3z"/>`,
  dragon: `<path fill="currentColor" d="M3 12c4-1 6-3.5 7-7.5 2 3 1.5 6-.5 8 3 .2 6-1 9-4-1 5.5-5.5 9.5-11.5 9.5C4 17.5 2.2 15 3 12z"/>`,
  steel: `<path ${STROKE} d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>`,
  fairy: `<path fill="currentColor" d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z"/>`,
};

interface IProps {
  type: string;
  className?: string;
}

const TypeIcon = ({ type, className }: IProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: ICON_MARKUP[type] ?? ICON_MARKUP.normal }}
  />
);

export default TypeIcon;
