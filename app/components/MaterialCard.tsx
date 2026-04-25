'use client';

import { ArrowUpRight } from 'lucide-react';

interface MaterialCardProps {
  name: string;
  quantity: number;
  unit: string;
  value: number;
  currency: string;
  color: string;
  percentageOfTotal: number;
}

export default function MaterialCard({
  name,
  quantity,
  unit,
  value,
  currency,
  color,
  percentageOfTotal,
}: MaterialCardProps) {
  return (
    <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-white/5 hover:border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Background glow effect */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${color}`}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${color}`} />
            <h3 className="text-white font-semibold">{name}</h3>
          </div>
          <ArrowUpRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>

        {/* Quantidade */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-white">
            {quantity.toLocaleString('pt-BR', {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
            <span className="text-sm font-normal text-white/60 ml-2">
              {unit}
            </span>
          </p>
        </div>

        {/* Valor */}
        <div className="mb-4 pb-4 border-t border-white/10">
          <p className="text-sm text-white/60 mb-1">Valor Total</p>
          <p className="text-xl font-bold text-white">
            {currency} {value.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Percentual */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${color}`}
              style={{ width: `${percentageOfTotal}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-white/80">
            {percentageOfTotal.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
