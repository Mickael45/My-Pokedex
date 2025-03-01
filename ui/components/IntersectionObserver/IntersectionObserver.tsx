import { useRef, useState, useEffect, memo, JSX } from "react";
import useIntersectionObserver from "../../../hooks/useIntersectionObserver";

interface IProps {
  children: JSX.Element;
  handleIntersection: () => void;
}

const IntersectionObserver = ({ children, handleIntersection }: IProps) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);
  const entry = useIntersectionObserver(ref, { threshold: 0.9 });

  const updateIsIntersecting = () => {
    if (entry?.isIntersecting && !isIntersecting) {
      handleIntersection();
      setIsIntersecting(true);
    } else if (!entry?.isIntersecting && isIntersecting) {
      setIsIntersecting(false);
    }
  };

  useEffect(updateIsIntersecting, [entry]);

  console.log(ref, children)
  return <span ref={ref}>{children}</span>;
};

export default memo(IntersectionObserver);
