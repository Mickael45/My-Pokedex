import animations from "./transform.module.css";

export const getRandomTransformAnimation = () => {
  const transformTypes = ["Right", "Top", "Left", "Bottom"];
  const randomTransitionTypeIndex = Math.floor(Math.random() * transformTypes.length);

  return animations[`transform${transformTypes[randomTransitionTypeIndex]}`];
};
