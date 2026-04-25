'use client';

import { Calendar, X } from 'lucide-react';
import { useState } from 'react';

interface FilterSectionProps {
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  startDate: string;
  endDate: string;
  region: string;
  product: string;
  seller: string;
  material: string;
}

export default function FilterSection({ onFilterChange }: FilterSectionProps) {
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    region: '',
    product: '',
    seller: '',
    material: '',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      startDate: '',
      endDate: '',
      region: '',
      product: '',
      seller: '',
      material: '',
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <Calendar size={20} />
          Filtros Avançados
        </h3>
        {Object.values(filters).some((v) => v) && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition"
          >
            <X size={16} />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Data Início */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Período Início
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              handleFilterChange('startDate', e.target.value)
            }
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Data Fim */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Período Fim
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              handleFilterChange('endDate', e.target.value)
            }
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Região */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Região
          </label>
          <select
            value={filters.region}
            onChange={(e) =>
              handleFilterChange('region', e.target.value)
            }
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition"
          >
            <option value="">Selecionar...</option>
            <option value="norte">Norte</option>
            <option value="nordeste">Nordeste</option>
            <option value="centro-oeste">Centro-Oeste</option>
            <option value="sudeste">Sudeste</option>
            <option value="sul">Sul</option>
          </select>
        </div>

        {/* Produto */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Produto
          </label>
          <select
            value={filters.product}
            onChange={(e) =>
              handleFilterChange('product', e.target.value)
            }
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition"
          >
            <option value="">Selecionar...</option>
            <option value="trefilado">Trefilado</option>
            <option value="laminado">Laminado</option>
            <option value="extrudado">Extrudado</option>
            <option value="fundido">Fundido</option>
          </select>
        </div>

        {/* Vendedor */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Vendedor
          </label>
          <select
            value={filters.seller}
            onChange={(e) =>
              handleFilterChange('seller', e.target.value)
            }
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition"
          >
            <option value="">Selecionar...</option>
            <option value="vendedor1">Vendedor 1</option>
            <option value="vendedor2">Vendedor 2</option>
            <option value="vendedor3">Vendedor 3</option>
          </select>
        </div>

        {/* Material */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Material
          </label>
          <select
            value={filters.material}
            onChange={(e) =>
              handleFilterChange('material', e.target.value)
            }
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition"
          >
            <option value="">Selecionar...</option>
            <option value="cobre">Cobre</option>
            <option value="latao">Latão</option>
            <option value="aluminio">Alumínio</option>
            <option value="inox">Inox</option>
          </select>
        </div>
      </div>
    </div>
  );
}
