export const getElementById = (id: string) => document.getElementById(id);

export const getDivClassesById = (id: string): DOMTokenList | null => {
  const element = getElementById(id) as HTMLDivElement;

  if (!element) {
    return null;
  }
  return element.classList;
};

export const addClassToElement = (element: HTMLElement, style: string) => element.classList.add(style);

export const addCheckedDatasetToElement = (element: HTMLElement) => {
  console.log("ADDING");
  element.dataset.checked = "true";
};

export const removeClassFromElement = (element: HTMLElement, style: string) => element.classList.remove(style);

export const removeCheckedDatasetFromElement = (element: HTMLElement) => {
  element.dataset.checked = "false";
};

export const getElementByQuerySelector = (querySelector: string) =>
  document.querySelector(querySelector) as HTMLElement;

export const doesElementContainClass = (element: HTMLElement, className: string) =>
  element.classList.contains(className);
