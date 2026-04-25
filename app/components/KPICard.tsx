import React from 'react';

type Status = 'up' | 'down' | 'neutral';
type TargetStatus = 'good' | 'warning' | 'bad' | 'neutral';

interface KPICardProps {
  title: string;
  value: number;
  previousValue: number;
  unit: string;
  icon: string;
  status: Status;
  targetValue?: number;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  previousValue,
  unit,
  icon,
  status,
  targetValue,
}) => {
  const deltaPercent = previousValue > 0 ? ((value - previousValue) / previousValue * 100) : 0;
  const percentStr = deltaPercent.toFixed(1) + '%';

  const getTargetStatus = (v: number, t: number): TargetStatus => {
    if (v >= t) return 'good';
    if (v >= t * 0.95) return 'warning';
    return 'bad';
  };

  const targetStatus: TargetStatus = targetValue !== undefined ? getTargetStatus(value, targetValue) : 'neutral';

  const getBgClass = (s: TargetStatus): string => {
    switch (s) {
      case 'good':
        return 'bg-gradient-to-br from-emerald-400/20 via-emerald-500/20 to-emerald-600/20';
      case 'warning':
        return 'bg-gradient-to-br from-amber-400/20 via-amber-500/20 to-amber-600/20';
      case 'bad':
        return 'bg-gradient-to-br from-rose-400/20 via-rose-500/20 to-rose-600/20';
      default:
        return 'bg-gradient-to-br from-slate-100/30 via-slate-200/30 to-slate-300/30';
    }
  };

  const arrow = status === 'up' ? '▲' : status === 'down' ? '▼' : '→';
  const varColor = status === 'up' ? 'text-emerald-600 font-bold' : status === 'down' ? 'text-rose-600 font-bold' : 'text-gray-500 font-medium';

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 ring-1 ring-white/10/75 ${getBgClass(targetStatus)} backdrop-blur-xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-1`}>
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
      <div className="relative flex items-stretch md:items-center justify-between gap-4 md:gap-0 h-28 md:h-32">
        <div className="flex flex-col justify-center space-y-2 flex-shrink-0">
          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-indigo-500/80 to-blue-600/80 p-3 flex items-center justify-center shadow-lg backdrop-blur-sm ${icon}`} />
          <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 leading-tight truncate max-w-[120px] md:max-w-none">{title}</h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center -mt-2 md:-mt-4">
          <div className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 tracking-tight leading-none">{value.toLocaleString()}</div>
          <div className="text-lg md:text-xl font-medium text-gray-500 mt-1">{unit}</div>
        </div>
        <div className="flex flex-col items-end justify-center space-y-1 md:space-y-2 flex-shrink-0">
          <span className={`text-2xl md:text-3xl lg:text-4xl ${varColor} animate-pulse`}>{arrow}</span>
          <span className={`text-lg md:text-xl font-bold ${varColor} whitespace-nowrap`}>
            {deltaPercent >= 0 ? '+' : ''}{percentStr}
          </span>
        </div>
      </div>
    </div>
  );
};

KPICard.displayName = 'KPICard';

export default KPICard;
