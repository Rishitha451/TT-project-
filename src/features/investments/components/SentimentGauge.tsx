

interface SentimentGaugeProps {
  score: number;
  label: string;
}

export function SentimentGauge({ score, label }: SentimentGaugeProps) {
  const radius = 80;
  const cx = 100;
  const cy = 95;

  const polarToCartesian = (angleDeg: number) => {
    const rad = ((angleDeg - 180) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const needleEnd = polarToCartesian((score / 100) * 180);

  let colorClass = 'text-slate-600';
  let strokeClass = 'hsl(215 16% 47%)'; // slate-500
  if (score >= 65) { colorClass = 'text-emerald-600'; strokeClass = 'hsl(142 71% 45%)'; } // emerald-500
  else if (score <= 35) { colorClass = 'text-rose-600'; strokeClass = 'hsl(349 89% 60%)'; } // rose-500

  return (
    <div className="flex flex-col items-center w-full max-w-[240px]">
      <svg viewBox="0 0 200 110" className="w-full">
        {/* Background arc */}
        <path d="M 20 95 A 80 80 0 0 1 180 95" fill="none" stroke="hsl(210 40% 96%)" strokeWidth="12" strokeLinecap="round" />
        {/* Colored segments */}
        <path d="M 20 95 A 80 80 0 0 1 66 35" fill="none" stroke="hsl(349 89% 60%)" strokeWidth="12" strokeLinecap="round" opacity="0.2" />
        <path d="M 66 35 A 80 80 0 0 1 134 35" fill="none" stroke="hsl(215 16% 47%)" strokeWidth="12" strokeLinecap="round" opacity="0.2" />
        <path d="M 134 35 A 80 80 0 0 1 180 95" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="12" strokeLinecap="round" opacity="0.2" />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke={strokeClass} strokeWidth="3" strokeLinecap="round" className="transition-all duration-700 ease-out" />
        <circle cx={cx} cy={cy} r="6" fill={strokeClass} />
        <circle cx={cx} cy={cy} r="2" fill="white" />
      </svg>
      <div className="text-center mt-2">
        <div className={`text-4xl font-bold font-mono ${colorClass}`}>{score.toFixed(1)}</div>
        <div className={`text-sm font-bold uppercase tracking-wider mt-1 ${colorClass}`}>{label}</div>
      </div>
    </div>
  );
}
