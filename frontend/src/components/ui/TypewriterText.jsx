import { useState, useEffect } from 'react';

const TypewriterText = ({ text, speed = 50, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return (
    <span className={className}>
      {displayText}
      {index < text.length && <span className="animate-pulse">|</span>}
    </span>
  );
};

export default TypewriterText;
