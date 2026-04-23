"use client";

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

type Etapa = 'leads' | 'propostas' | 'contratos' | 'faturado';

interface Venda {
  id: number;
  data: string;
  periodo: string;
  regiao: string;
  produto: string;
  vendedor: string;
  cliente: string;
  valor: number;
  meta: number;
  etapa: Etapa;
}

interface Filters {
  periodo: string;
  regiao: string;
  produto: string;
  vendedor: string;
}

interface TopVendedor {
  vendedor: string;
  valor: number;
  meta: number;
  progresso: number;
}

interface TopCliente {
  cliente: string;
  valor: number;
  count: number;
}

interface FunnelItem {
  name: string;
  value: number;
  color: string;
}

export default function Home() {
  const vendas: Venda[] = [
    {id:1, data:'2024-01-05', periodo:'2024-01', regiao:'Sudeste', produto:'Estruturas Metálicas', vendedor:'João Silva', cliente:'Construtora ABC', valor:30000, meta:25000, etapa:'faturado'},
    {id:2, data:'2024-01-12', periodo:'2024-01', regiao:'Sul', produto:'Portões Automáticos', vendedor:'Ana Costa', cliente:'Fazenda XYZ', valor:18000, meta:20000, etapa:'contratos'},
    {id:3, data:'2024-01-20', periodo:'2024-01', regiao:'Nordeste', produto:'Escadas', vendedor:'Pedro Santos', cliente:'Indústria DEF', valor:12000, meta:15000, etapa:'propostas'},
    {id:4, data:'2024-01-28', periodo:'2024-01', regiao:'Centro-Oeste', produto:'estagio', vendedor:'Lucas Mendes', cliente:'Comercial GHI', valor:0, meta:10000, etapa:'leads'},
    {id:5, data:'2024-02-03', periodo:'2024-02', regiao:'Sudeste', produto:'Grades de Proteção', vendedor:'Fernanda Lima', cliente:'Residencial JKL', valor:22000, meta:18000, etapa:'faturado'},
    {id:6, data:'2024-02-10', periodo:'2024-02', regiao:'Sul', produto:'Portas', vendedor:'Carlos Souza', cliente:'Empresa MNO', valor:15000, meta:16000, etapa:'contratos'},
    {id:7, data:'2024-02-18', periodo:'2024-02', regiao:'Nordeste', produto:'Estruturas Metálicas', vendedor:'João Silva', cliente:'Cliente PQR', valor:25000, meta:22000, etapa:'propostas'},
    {id:8, data:'2024-02-25', periodo:'2024-02', regiao:'Centro-Oeste', produto:'Escadas', vendedor:'Ana Costa', cliente:'Business STU', valor:0, meta:12000, etapa:'leads'},
    {id:9, data:'2024-03-02', periodo:'2024-03', regiao:'Sudeste', produto:'estagio', vendedor:'Pedro Santos', cliente:'Corporação VWX', valor:35000, meta:28000, etapa:'faturado'},
    {id:10, data:'2024-03-09', periodo:'2024-03', regiao:'Sul', produto:'Portões Automáticos', vendedor:'Lucas Mendes', cliente:'Ltda YZ0', valor:19000, meta:21000, etapa:'contratos'},
    {id:11, data:'2024-03-16', periodo:'2024-03', regiao:'Nordeste', produto:'Grades de Proteção', vendedor:'Fernanda Lima', cliente:'Construtora 123', valor:14000, meta:17000, etapa:'propostas'},
    {id:12, data:'2024-03-23', periodo:'2024-03', regiao:'Centro-Oeste', produto:'Portas', vendedor:'Carlos Souza', cliente:'Fábrica 456', valor:0, meta:11000, etapa:'leads'},
    {id:13, data:'2024-04-01', periodo:'2024-04', regiao:'Sudeste', produto:'Estruturas Metálicas', vendedor:'João Silva', cliente:'Loja 789', valor:28000, meta:24000, etapa:'faturado'},
    {id:14, data:'2024-04-08', periodo:'2024-04', regiao:'Sul', produto:'Escadas', vendedor:'Ana Costa', cliente:'Projeto ABC1', valor:20000, meta:19000, etapa:'contratos'},
    {id:15, data:'2024-04-15', periodo:'2024-04', regiao:'Nordeste', produto:'estagio', vendedor:'Pedro Santos', cliente:'Obra DEF2', valor:16000, meta:14000, etapa:'propostas'},
    {id:16, data:'2024-04-22', periodo:'2024-04', regiao:'Centro-Oeste', produto:'Portões Automáticos', vendedor:'Lucas Mendes', cliente:'Construtora ABC', valor:0, meta:13000, etapa:'leads'},
    {id:17, data:'2024-05-05', periodo:'2024-05', regiao:'Sudeste', produto:'Grades de Proteção', vendedor:'Fernanda Lima', cliente:'Fazenda XYZ', valor:26000, meta:23000, etapa:'faturado'},
    {id:18, data:'2024-05-12', periodo:'2024-05', regiao:'Sul', produto:'Portas', vendedor:'Carlos Souza', cliente:'Indústria DEF', valor:17000, meta:20000, etapa:'contratos'},
    {id:19, data:'2024-05-20', periodo:'2024-05', regiao:'Nordeste', produto:'Estruturas Metálicas', vendedor:'João Silva', cliente:'Comercial GHI', valor:0, meta:16000, etapa:'leads'},
    {id:20, data:'2024-05-27', periodo:'2024-05', regiao:'Centro-Oeste', produto:'Escadas', vendedor:'Ana Costa', cliente:'Residencial JKL', valor:21000, meta:18000, etapa:'propostas'},
    {id:21, data:'2024-06-03', periodo:'2024-06', regiao:'Sudeste', produto:'estagio', vendedor:'Pedro Santos', cliente:'Empresa MNO', valor:32000, meta:27000, etapa:'faturado'},
    {id:22, data:'2024-06-10', periodo:'2024-06', regiao:'Sul', produto:'Portões Automáticos', vendedor:'Lucas Mendes', cliente:'Cliente PQR', valor:23000, meta:22000, etapa:'contratos'},
    {id:23, data:'2024-06-17', periodo:'2024-06', regiao:'Nordeste', produto:'Grades de Proteção', vendedor:'Fernanda Lima', cliente:'Business STU', valor:0, meta:15000, etapa:'leads'},
    {id:24, data:'2024-06-24', periodo:'2024-06', regiao:'Centro-Oeste', produto:'Portas', vendedor:'Carlos Souza', cliente:'Corporação VWX', valor:18000, meta:17000, etapa:'propostas'},
    {id:25, data:'2024-01-08', periodo:'2024-01', regiao:'Sudeste', produto:'Escadas', vendedor:'Fernanda Lima', cliente:'Ltda YZ0', valor:24000, meta:21000, etapa:'faturado'},
    {id:26, data:'2024-02-14', periodo:'2024-02', regiao:'Nordeste', produto:'estagio', vendedor:'Lucas Mendes', cliente:'Construtora 123', valor:0, meta:12000, etapa:'leads'},
    {id:27, data:'2024-03-11', periodo:'2024-03', regiao:'Sul', produto:'Estruturas Metálicas', vendedor:'Carlos Souza', cliente:'Fábrica 456', valor:29000, meta:25000, etapa:'faturado'},
    {id:28, data:'2024-04-19', periodo:'2024-04', regiao:'Centro-Oeste', produto:'Portões Automáticos', vendedor:'João Silva', cliente:'Loja 789', valor:15500, meta:19000, etapa:'contratos'},
    {id:29, data:'2024-05-14', periodo:'2024-05', regiao:'Sudeste', produto:'Grades de Proteção', vendedor:'Ana Costa', cliente:'Projeto ABC1', valor:0, meta:14000, etapa:'leads'},
    {id:30, data:'2024-06-21', periodo:'2024-06', regiao:'Nordeste', produto:'Escadas', vendedor:'Pedro Santos', cliente:'Obra DEF2', valor:27000, meta:24000, etapa:'faturado'}
  ];

  const [filters, setFilters] = useState<Filters>({
    periodo: '',
    regiao: '',
    produto: '',
    vendedor: '',
  });

  const optionsPeriodos = useMemo(
    () => Array.from(new Set(vendas.map((v) => v.periodo))).sort(),
    []
  );

  const optionsRegioes = useMemo(
    () => Array.from(new Set(vendas.map((v) => v.regiao))).sort(),
    []
  );

  const optionsProdutos = useMemo(
    () => Array.from(new Set(vendas.map((v) => v.produto))).sort(),
    []
  );

  const optionsVendedores = useMemo(
    () => Array.from(new Set(vendas.map((v) => v.vendedor))).sort(),
    []
  );

  const filteredVendas = useMemo(() =>
    vendas.filter(
      (v) =>
        (filters.periodo === '' || v.periodo === filters.periodo) &&
        (filters.regiao === '' || v.regiao === filters.regiao) &&
        (filters.produto === '' || v.produto === filters.produto) &&
        (filters.vendedor === '' || v.vendedor === filters.vendedor)
    ),
    [vendas, filters]
  );

  const topVendedores = useMemo((): TopVendedor[] => {
    const faturados = filteredVendas.filter((v) => v.etapa === 'faturado');
    const sums: Record<string, { valor: number; meta: number }> = {};
    faturados.forEach((v) => {
      if (!sums[v.vendedor]) {
        sums[v.vendedor] = { valor: 0, meta: 0 };
      }
      sums[v.vendedor].valor += v.valor;
      sums[v.vendedor].meta += v.meta;
    });
    return Object.entries(sums)
      .map(([vendedor, data]) => ({
        vendedor,
        ...data,
        progresso: data.meta > 0 ? (data.valor / data.meta) * 100 : 0,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 3);
  }, [filteredVendas]);

  const funnelData = useMemo<FunnelItem[]>(() => [
    {
      name: 'Leads',
      value: filteredVendas.filter((v) => v.etapa === 'leads').length,
      color: 'bg-blue-500',
    },
    {
      name: 'Propostas',
      value: filteredVendas.filter((v) => v.etapa === 'propostas').length,
      color: 'bg-emerald-500',
    },
    {
      name: 'Contratos',
      value: filteredVendas.filter((v) => v.etapa === 'contratos').length,
      color: 'bg-amber-500',
    },
    {
      name: 'Faturado',
      value: filteredVendas.filter((v) => v.etapa === 'faturado').length,
      color: 'bg-green-500',
    },
  ], [filteredVendas]);

  const topClientes = useMemo((): TopCliente[] => {
    const faturados = filteredVendas.filter((v) => v.etapa === 'faturado');
    const sums: Record<string, { valor: number; count: number }> = {};
    faturados.forEach((v) => {
      if (!sums[v.cliente]) {
        sums[v.cliente] = { valor: 0, count: 0 };
      }
      sums[v.cliente].valor += v.valor;
      sums[v.cliente].count += 1;
    });
    return Object.entries(sums)
      .map(([cliente, data]) => ({ cliente, ...data }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }, [filteredVendas]);

  const formatCurrency = (value: number): string =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getMetaColor = (progress: number): string => {
    if (progress >= 100) return 'bg-green-400 text-green-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg';
    if (progress >= 80) return 'bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg';
    return 'bg-red-400 text-red-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg';
  };

  const medals = ['🥇', '🥈', '🥉'];

  const exportToExcel = () => {
    const dataExport = filteredVendas.map((v) => ({
      ID: v.id,
      Data: v.data,
      Periodo: v.periodo,
      Regiao: v.regiao,
      Produto: v.produto,
      Vendedor: v.vendedor,
      Cliente: v.cliente,
      Valor: v.valor,
      Meta: v.meta,
      Etapa: v.etapa,
    }));
    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendas');
    XLSX.writeFile(wb, `vendas-metalfama-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const maxFunnelValue = Math.max(...funnelData.map((d) => d.value), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-blue-300/90 to-purple-400 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
            Dashboard Vendas
          </h1>
          <h2 className="text-2xl md:text-3xl text-white/80 font-light tracking-wide">
            Metalfama - Performance em Tempo Real
          </h2>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 mb-12 hover:shadow-3xl transition-all">
          <h2 className="text-3xl font-bold text-white mb-8">🔍 Filtros Dinâmicos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">Período</label>
              <select
                value={filters.periodo}
                onChange={(e) => setFilters({ ...filters, periodo: e.target.value })}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white font-medium backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all shadow-lg hover:shadow-xl"
              >
                <option value="">Todos os Períodos</option>
                {optionsPeriodos.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">Região</label>
              <select
                value={filters.regiao}
                onChange={(e) => setFilters({ ...filters, regiao: e.target.value })}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white font-medium backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all shadow-lg hover:shadow-xl"
              >
                <option value="">Todas Regiões</option>
                {optionsRegioes.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">Produto</label>
              <select
                value={filters.produto}
                onChange={(e) => setFilters({ ...filters, produto: e.target.value })}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white font-medium backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all shadow-lg hover:shadow-xl"
              >
                <option value="">Todos Produtos</option>
                {optionsProdutos.map((prod) => (
                  <option key={prod} value={prod}>
                    {prod}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">Vendedor</label>
              <select
                value={filters.vendedor}
                onChange={(e) => setFilters({ ...filters, vendedor: e.target.value })}
                className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white font-medium backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all shadow-lg hover:shadow-xl"
              >
                <option value="">Todos Vendedores</option>
                {optionsVendedores.map((ven) => (
                  <option key={ven} value={ven}>
                    {ven}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {topVendedores.map((vendedor, index) => (
            <div
              key={vendedor.vendedor}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 hover:shadow-4xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-40 transition-opacity">
                ⭐
              </div>
              <div className="flex items-start gap-6 mb-6">
                <div className="text-5xl flex-shrink-0 mt-2">{medals[index] || '🏅'}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl lg:text-3xl font-black text-white truncate mb-2">
                    {vendedor.vendedor}
                  </h3>
                  <p className="text-2xl text-green-400 font-bold mb-1">
                    {formatCurrency(vendedor.valor)}
                  </p>
                  <p className="text-sm text-gray-400">Meta: {formatCurrency(vendedor.meta)}</p>
                </div>
              </div>
              <div className={getMetaColor(vendedor.progresso)}>
                {Math.round(vendedor.progresso)}% da Meta
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Funil */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-10 hover:shadow-3xl transition-all">
            <h2 className="text-3xl font-bold text-white mb-10 text-center">📈 Funil de Vendas</h2>
            <div className="space-y-8">
              {funnelData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-8 px-6 py-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/5 hover:bg-white/10 transition-all">
                  <div className="w-28 text-right text-lg font-bold text-gray-200">
                    {item.name}
                  </div>
                  <div className="flex-1 h-8 bg-white/10 rounded-2xl overflow-hidden shadow-inner">
                    <div
                      className={`h-full ${item.color} shadow-lg transition-all duration-700 ease-out`}
                      style={{ width: `${(item.value / maxFunnelValue) * 100}%` }}
                    />
                  </div>
                  <div className="w-24 text-right text-2xl font-black text-white">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clientes */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 hover:shadow-3xl transition-all overflow-hidden">
            <h2 className="text-3xl font-bold text-white mb-8">🏆 Top 10 Clientes</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left pb-6 pr-8 py-2 text-gray-300 font-bold text-lg w-2/3">Cliente</th>
                    <th className="text-right pb-6 py-2 text-gray-300 font-bold text-lg">Faturado</th>
                    <th className="text-right pb-6 py-2 text-gray-300 font-bold text-lg">Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {topClientes.map((cliente, index) => (
                    <tr
                      key={cliente.cliente}
                      className="border-b border-white/5 hover:bg-white/10 transition-all group"
                    >
                      <td className="py-6 pr-8 font-semibold text-white text-lg group-hover:text-blue-300">
                        {cliente.cliente}
                      </td>
                      <td className="py-6 text-right font-black text-2xl text-green-400">
                        {formatCurrency(cliente.valor)}
                      </td>
                      <td className="py-6 text-right font-bold text-blue-400 text-xl">
                        {cliente.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="text-center pt-12">
          <button
            onClick={exportToExcel}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-black py-8 px-20 rounded-3xl text-2xl shadow-2xl hover:shadow-4xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm border-2 border-white/20 group"
          >
            <span className="group-hover:scale-110 transition-transform">📊 Exportar Excel Completo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
