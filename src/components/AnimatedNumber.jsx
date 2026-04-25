import { useState, useEffect, useRef } from 'react';

export default function AnimatedNumber({ value, duration = 1500, format = 'number', decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef(null);
  const animationFrame = useRef(null);

  useEffect(() => {
    const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * numericValue;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    startTime.current = null;
    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value, duration]);

  const formatValue = (val) => {
    if (format === 'hours') {
      const hours = Math.floor(val / 60);
      const mins = Math.round(val % 60);
      return `${hours.toLocaleString()}h ${mins}m`;
    }
    if (format === 'percent') {
      return `${val.toFixed(1)}%`;
    }
    if (decimals > 0) {
      return val.toFixed(decimals);
    }
    return Math.round(val).toLocaleString();
  };

  return <span className="animated-number">{formatValue(displayValue)}</span>;
}
