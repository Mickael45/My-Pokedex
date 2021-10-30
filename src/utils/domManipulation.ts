export const getDivClassesById = (id: string): DOMTokenList | null => {
  const element = document.getElementById(id) as HTMLDivElement;

  if (!element) {
    return null;
  }
  return element.classList;
};

export const addClassToElement = (element: HTMLElement, style: string) => element.classList.add(style);

export const removeClassFromElement = (element: HTMLElement, style: string) => element.classList.remove(style);

export const getElementByQuerySelector = (querySelector: string) =>
  document.querySelector(querySelector) as HTMLElement;

export const doesElementContainClass = (element: HTMLElement, className: string) =>
  element.classList.contains(className);
