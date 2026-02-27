import { useEffect, useRef, useState } from 'react';

type AnimatedNumberProps = {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (n: number) => string;
};

const AnimatedNumber = ({
  value,
  duration = 600,
  className,
  formatter,
}: AnimatedNumberProps) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    if (from === value) return;

    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = value;
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span className={className}>
      {formatter ? formatter(display) : display}
    </span>
  );
};

export default AnimatedNumber;
