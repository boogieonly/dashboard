import React from 'react';

type KPICardProps = {
  title: string;
  value: number;
  trend: number;
  icon?: React.ReactNode;
  subtitle?: string;
};

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, icon, subtitle }) => {
  const isPositive = trend >= 0;
  const trendColor = isPositive ? 'text-emerald-400' : 'text-red-400';
  const formattedValue = value.toLocaleString();
  const trendDisplay = `${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`;

  const ArrowIcon = () => (
    <svg
      className={`w-5 h-5 ${trendColor}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={isPositive
          ? "M5 15l7-7 7 7"
          : "M19 9l-7 7-7-7"
        }
      />
    </svg>
  );

  return (
    <div className="group relative bg-gradient-to-br from-white/10 via-white/5 to-black/10 backdrop-blur-3xl border border-white/20 shadow-2xl rounded-3xl p-8 w-80 h-72 flex flex-col justify-between hover:shadow-white/30 hover:scale-[1.02] transition-all duration-500 hover:border-white/30">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-semibold text-white/95 tracking-tight">{title}</h3>
        {icon && (
          <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      {/* Value and Trend */}
      <div className="flex-1 flex flex-col justify-end mb-6">
        <div className="text-5xl lg:text-6xl font-black text-white text-right leading-none drop-shadow-2xl mb-3">
          {formattedValue}
        </div>
        <div className="flex items-center justify-end space-x-2">
          <ArrowIcon />
          <span className={`text-lg font-semibold ${trendColor} drop-shadow-md`}>
            {trendDisplay}
          </span>
        </div>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-white/70 text-sm font-medium tracking-wide line-clamp-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default KPICard;
