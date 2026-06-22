'use client';

import React, { useRef, useState, useEffect } from 'react';

interface TextSplitterProps {
  text: string;
  type: 'lines' | 'words' | 'chars';
  className?: string;
  wordClassName?: string;
  charClassName?: string;
  lineClassName?: string;
}

export const TextSplitter: React.FC<TextSplitterProps> = ({
  text,
  type,
  className = '',
  wordClassName = 'split-word',
  charClassName = 'split-char',
  lineClassName = 'split-line',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[][]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle line splitting by measuring DOM positions after mount
  useEffect(() => {
    if (type !== 'lines' || !containerRef.current || !isClient) return;

    const measureAndGroup = () => {
      const words = Array.from(containerRef.current!.querySelectorAll('.measuring-word')) as HTMLElement[];
      if (words.length === 0) return;

      const groupedLines: string[][] = [];
      let currentLine: string[] = [];
      let currentTop = -1;

      words.forEach((wordSpan) => {
        const top = wordSpan.offsetTop;
        const textContent = wordSpan.textContent?.trim() || '';

        if (currentTop === -1) {
          currentTop = top;
          currentLine.push(textContent);
        } else if (Math.abs(top - currentTop) < 6) {
          currentLine.push(textContent);
        } else {
          groupedLines.push(currentLine);
          currentLine = [textContent];
          currentTop = top;
        }
      });

      if (currentLine.length > 0) {
        groupedLines.push(currentLine);
      }

      setLines(groupedLines);
    };

    // Run measurement
    measureAndGroup();

    // Listen to resize to recalculate line groups
    window.addEventListener('resize', measureAndGroup);
    return () => window.removeEventListener('resize', measureAndGroup);
  }, [text, type, isClient]);

  // Initial SSR / Non-client render: output simple text
  if (!isClient) {
    return <span className={className}>{text}</span>;
  }

  // Render chars
  if (type === 'chars') {
    return (
      <span className={className} style={{ display: 'inline-block' }}>
        {text.split('').map((char, charIdx) => (
          <span
            key={charIdx}
            className={charClassName}
            style={{
              display: 'inline-block',
              whiteSpace: char === ' ' ? 'pre' : 'normal',
            }}
          >
            {char}
          </span>
        ))}
      </span>
    );
  }

  // Render words
  if (type === 'words') {
    return (
      <span className={className} style={{ display: 'inline-block' }}>
        {text.split(' ').map((word, wordIdx) => (
          <span
            key={wordIdx}
            className={wordClassName}
            style={{ display: 'inline-block', marginRight: '0.25em' }}
          >
            {word}
          </span>
        ))}
      </span>
    );
  }

  // Render lines (Double-pass: first render words to measure positions, then group them into block elements)
  if (type === 'lines') {
    if (lines.length === 0) {
      // First pass: render words inline for offset measurement
      return (
        <span ref={containerRef} className={className} style={{ display: 'block', opacity: 0 }}>
          {text.split(' ').map((word, idx) => (
            <span key={idx} className="measuring-word" style={{ display: 'inline-block', marginRight: '0.25em' }}>
              {word}
            </span>
          ))}
        </span>
      );
    }

    // Second pass: render grouped lines
    return (
      <span className={className} style={{ display: 'block' }}>
        {lines.map((lineWords, lineIdx) => (
          <span
            key={lineIdx}
            className={lineClassName}
            style={{
              display: 'block',
              overflow: 'hidden',
            }}
          >
            <span
              className="line-word-container"
              style={{
                display: 'inline-block',
              }}
            >
              {lineWords.join(' ')}
            </span>
          </span>
        ))}
      </span>
    );
  }

  return <span className={className}>{text}</span>;
};

export default TextSplitter;
