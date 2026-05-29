import React, { useMemo } from 'react';

interface TornDividerProps {
  color?: string; // Hex or tailwind color for the fill
  bgClass?: string; // Tailwind class
  accentColor?: string; // Optional accent color band (e.g. vibrant red) to look like a double rip
  orientation?: 'up' | 'down';
  className?: string;
  seed?: number;
}

export default function TornDivider({
  color = '#0B0B0B',
  bgClass = 'text-brand-dark',
  accentColor,
  orientation = 'down',
  className = '',
  seed = 42,
}: TornDividerProps) {
  // Generate a highly realistic organic jagged path for the torn edge
  const { pathData, accentPathData } = useMemo(() => {
    // We use a deterministic pseudo-random generator based on seed
    let currentSeed = seed;
    const random = () => {
      const x = Math.sin(currentSeed++) * 10000;
      return x - Math.floor(x);
    };

    const points = 45; // density of fiber details
    const width = 1440;
    const step = width / points;
    const baseLine = orientation === 'down' ? 10 : 80;
    const amplitude = 12; // height of tear variations

    const jaggedPoints: [number, number][] = [];

    // Start point
    jaggedPoints.push([0, baseLine]);

    for (let i = 1; i < points; i++) {
      const x = i * step + (random() - 0.5) * (step * 0.4);
      // Create organic peaks and waves utilizing sine and noise
      const wave = Math.sin((i / points) * Math.PI * 2) * 5;
      const noise = (random() - 0.5) * amplitude;
      const y = baseLine + wave + noise;
      jaggedPoints.push([x, y]);
    }

    jaggedPoints.push([width, baseLine]);

    // Build main filled path
    let mainPath = '';
    let accentPath = '';

    if (orientation === 'down') {
      // Normal top edge torn, filling the bottom space
      mainPath += `M 0 0 L 1440 0 L 1440 ${jaggedPoints[points - 1][1]}`;
      for (let i = points - 1; i >= 0; i--) {
        mainPath += ` L ${jaggedPoints[i][0]} ${jaggedPoints[i][1]}`;
      }
      mainPath += ' Z';

      if (accentColor) {
        accentPath += `M 0 ${jaggedPoints[0][1] + 4}`;
        for (let i = 0; i < points; i++) {
          accentPath += ` L ${jaggedPoints[i][0]} ${jaggedPoints[i][1] + 3 + random() * 4}`;
        }
        accentPath += ` L 1440 120 L 0 120 Z`;
      }
    } else {
      // Bottom edge torn, filling the top space
      mainPath += `M 0 120 L 1440 120 L 1440 ${jaggedPoints[points - 1][1]}`;
      for (let i = points - 1; i >= 0; i--) {
        mainPath += ` L ${jaggedPoints[i][0]} ${jaggedPoints[i][1]}`;
      }
      mainPath += ' Z';

      if (accentColor) {
        accentPath += `M 0 ${jaggedPoints[0][1] - 4}`;
        for (let i = 0; i < points; i++) {
          accentPath += ` L ${jaggedPoints[i][0]} ${jaggedPoints[i][1] - 3 - random() * 4}`;
        }
        accentPath += ` L 1440 0 L 0 0 Z`;
      }
    }

    return { pathData: mainPath, accentPathData: accentPath };
  }, [orientation, seed, accentColor]);

  // Height of SVG container
  const containerHeight = 'h-[40px] md:h-[60px] lg:h-[80px]';

  return (
    <div className={`relative w-full overflow-hidden ${containerHeight} select-none pointer-events-none ${className}`}>
      {accentColor && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          style={{ transform: orientation === 'up' ? 'scaleY(-1)' : 'none' }}
        >
          <path
            d={accentPathData}
            fill={accentColor}
            opacity="0.9"
          />
        </svg>
      )}
      <svg
        className={`absolute inset-0 w-full h-full ${bgClass}`}
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{ transform: orientation === 'up' ? 'scaleY(-1)' : 'none' }}
      >
        <path
          d={pathData}
          fill={color}
        />
      </svg>
    </div>
  );
}
