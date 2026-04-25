'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  icon?: React.ReactNode;
  backgroundColor?: string;
}

export default function KPICard({
  title,
  value,
  unit = '',
  trend,
  icon,
  backgroundColor = 'from-blue-500 to-blue-600',
}: KPICardProps) {
  const isTrendingUp = trend !== undefined && trend > 0;

  return (
    <div
      className={`bg-gradient-to-br ${backgroundColor} p-6 rounded-xl shadow-xl backdrop-blur-sm border border-white/10 hover:shadow-2xl transition-all duration-300 group cursor-pointer`}
    >
      {/* Header com ícone */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/80 text-sm font-medium">{title}</h3>
        {icon && <div className="text-white/60 group-hover:text-white transition">{icon}</div>}
      </div>

      {/* Valor Principal */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-white">
          {value}
          <span className="text-lg font-normal text-white/60 ml-1">{unit}</span>
        </p>
      </div>

      {/* Trend Indicator */}
      {trend !== undefined && (
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              isTrendingUp
                ? 'bg-green-500/20 text-green-300'
                : 'bg-red-500/20 text-red-300'
            }`}
          >
            {isTrendingUp ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            <span className="text-xs font-semibold">
              {Math.abs(trend)}%
            </span>
          </div>
          <span className="text-xs text-white/60">
            vs. mês anterior
          </span>
        </div>
      )}
    </div>
  );
}
