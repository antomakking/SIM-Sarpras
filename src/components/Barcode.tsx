import React, { useMemo } from 'react';

// Standard Code 128 Patterns (Table B)
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106 (106 is stop)
];

const START_CODE_B = 104;
const STOP_CODE = 106;

interface BarcodeProps {
  value: string;
  height?: number;
  barWidth?: number;
  showText?: boolean;
  textClassName?: string;
  className?: string;
  lineColor?: string;
  background?: string;
}

export function Barcode({
  value = '',
  height = 36,
  barWidth = 1.5,
  showText = false,
  textClassName = '',
  className = '',
  lineColor = '#0f172a',
  background = 'transparent',
}: BarcodeProps) {
  const { bars, totalModules } = useMemo(() => {
    if (!value || typeof value !== 'string') {
      return { bars: [], totalModules: 0 };
    }

    const cleanText = value.trim();
    const codes: number[] = [START_CODE_B];
    let checkSum = START_CODE_B;

    for (let i = 0; i < cleanText.length; i++) {
      const charCode = cleanText.charCodeAt(i);
      // Code 128B maps ASCII 32..126 to 0..94
      let codeVal = charCode - 32;
      if (codeVal < 0 || codeVal > 95) {
        codeVal = 0; // fallback for unencodable chars
      }
      codes.push(codeVal);
      checkSum += codeVal * (i + 1);
    }

    codes.push(checkSum % 103);
    codes.push(STOP_CODE);

    // Convert code sequence into black and white bar segments
    const barSegments: { x: number; width: number }[] = [];
    let currentX = 0;

    // Quiet zone at start (10 modules)
    const quietZone = 6;
    currentX += quietZone;

    for (const code of codes) {
      const pattern = CODE128_PATTERNS[code] || CODE128_PATTERNS[0];
      let isBar = true; // starts with bar

      for (let p = 0; p < pattern.length; p++) {
        const w = parseInt(pattern[p], 10);
        if (isBar) {
          barSegments.push({
            x: currentX,
            width: w,
          });
        }
        currentX += w;
        isBar = !isBar; // toggle bar and space
      }
    }

    currentX += quietZone;

    return {
      bars: barSegments,
      totalModules: currentX,
    };
  }, [value]);

  if (bars.length === 0) {
    return null;
  }

  const svgWidth = totalModules * barWidth;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={svgWidth}
        height={height}
        viewBox={`0 0 ${totalModules} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className="overflow-visible"
        style={{ backgroundColor: background }}
      >
        {bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={0}
            width={bar.width}
            height={height}
            fill={lineColor}
          />
        ))}
      </svg>
      {showText && (
        <span className={`font-mono text-[11px] font-bold tracking-widest text-slate-800 dark:text-slate-200 mt-1 ${textClassName}`}>
          {value}
        </span>
      )}
    </div>
  );
}

export default Barcode;
