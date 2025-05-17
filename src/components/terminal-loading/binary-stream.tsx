import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface BinaryStreamProps {
  length?: number;
  className?: string;
  speed?: number;
  density?: number;
  height?: number;
}

export const BinaryStream: React.FC<BinaryStreamProps> = ({
  length = 200,
  className = "",
  speed = 100,
  density = 10,
  height = 6,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(100);
  const [stream, setStream] = useState<Array<{value: string, highlight: boolean, color: string}>>([]);

  // Calculate columns based on container width
  useEffect(() => {
    if (containerRef.current) {
      const calculateColumns = () => {
        const containerWidth = containerRef.current?.clientWidth || 0;
        const newColumns = Math.floor(containerWidth / 12); // Adjust based on character width
        setColumns(newColumns);
      };

      calculateColumns();
      window.addEventListener('resize', calculateColumns);
      return () => window.removeEventListener('resize', calculateColumns);
    }
  }, []);

  // Generate and update stream
  useEffect(() => {
    if (columns === 0) return;
    
    // Generate initial stream
    const rows = height;
    const totalCells = rows * columns;
    const initialStream = Array(totalCells)
      .fill(0)
      .map(() => ({
        value: Math.random() > 0.5 ? "1" : "0",
        highlight: Math.random() > 0.92,
        color: Math.random() > 0.98 ? "#f87171" : 
               Math.random() > 0.8 ? "#ef4444" : "#991b1b"
      }));
    setStream(initialStream);

    // Update stream periodically
    const interval = setInterval(() => {
      setStream((prev) => {
        const newStream = [...prev];
        // Update random positions
        for (let i = 0; i < Math.floor(totalCells / density); i++) {
          const pos = Math.floor(Math.random() * totalCells);
          newStream[pos] = {
            value: Math.random() > 0.5 ? "1" : "0",
            highlight: Math.random() > 0.92,
            color: Math.random() > 0.98 ? "#f87171" : 
                   Math.random() > 0.8 ? "#ef4444" : "#991b1b"
          };
        }
        return newStream;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [columns, speed, density, height]);

  return (
    <div
      ref={containerRef}
      className={`font-mono text-xs overflow-hidden w-full ${className}`}
    >
      <div className="grid" style={{ 
        gridTemplateColumns: `repeat(${columns}, minmax(8px, 1fr))`,
        gap: '0px'
      }}>
        {stream.map((bit, index) => (
          <div
            key={index}
            className="inline-block text-center"
            style={{ 
              color: bit.color,
              textShadow: bit.highlight ? "0 0 5px rgba(239, 68, 68, 0.7)" : "none",
              opacity: bit.highlight ? 1 : 0.8
            }}
          >
            {bit.value}
          </div>
        ))}
      </div>
    </div>
  );
};
