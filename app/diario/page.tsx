'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type NumericField = 'faturamento' | 'vendas' | 'atrasos' | 'carteiraTotal' | 'previsaoMesAtual' | 'previsaoMesSeguinte';

type FormData = {
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteiraTotal: number;
  previsaoMesAtual: number;
  previsaoMesSeguinte: number;
  observacoes: string;
};

type DiarioEntry = {
  id: string;
  date: string;
} & FormData;

type Metas = {
  faturamento: number;
  vendas: number;
};

type KpiConfig = {
  label: string;
  value: number;
  prefix: string;
  color: string;
  type: 'accum' | 'position';
  key: NumericField;
};

const glassmorphism = 'bg-white/20 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-3xl p-8 hover:shadow-3xl transition-all duration-300 group-hover:scale-[1.02]';

const Sparkline: React.FC<{ data: number[]; className?: string }> = ({ data, className }) => {
  if (!data.length || data.every((v) => v === 0)) {
    return <div className="h-8 flex items-center justify-center text-sm text-muted-foreground">—</div>;
  }

  const maxV = Math.max(...data);
  const minV = Math.min(...data);
  const range = maxV - minV || 1;
  const height = 30;
  const width = 120;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 4);
    const y = height - 4 - ((v - minV) / range) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-8 ${className || ''}`}
      fill="none"
    >
      <polyline
        points={points}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function DiarioPage() {
  const [entries, setEntries] = useState<DiarioEntry[]>([]);
  const [metas, setMetas] = useState<Metas>({ faturamento: 0, vendas: 0 });
  const [form, setForm] = useState<FormData>({
    faturamento: 0,
    vendas: 0,
    atrasos: 0,
    carteiraTotal: 0,
    previsaoMesAtual: 0,
    previsaoMesSeguinte: 0,
    observacoes: '',
  });
  const [showMetasModal, setShowMetasModal] = useState(false);
  const [metasForm, setMetasForm] = useState<Metas>({ faturamento: 0, vendas: 0 });

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedEntries = localStorage.getItem('diario-entries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }

    const savedMetas = localStorage.getItem('diario-metas');
    if (savedMetas) {
      setMetas(JSON.parse(savedMetas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diario-entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('diario-metas', JSON.stringify(metas));
  }, [metas]);

  const currentMonthEntries = useMemo(() => {
    const todayDate = new Date(today);
    return entries.filter((e) => {
      const entryDate = new Date(e.date);
      return (
        entryDate <= todayDate &&
        entryDate.getFullYear() === todayDate.getFullYear() &&
        entryDate.getMonth() === todayDate.getMonth()
      );
    });
  }, [entries, today]);

  const currentSums = useMemo(() => ({
    faturamento: currentMonthEntries.reduce((sum, e) => sum + e.faturamento, 0),
    vendas: currentMonthEntries.reduce((sum, e) => sum + e.vendas, 0),
    atrasos: currentMonthEntries.reduce((sum, e) => sum + e.atrasos, 0),
  }), [currentMonthEntries]);

  const getLastSnapshotValue = useCallback((field: NumericField): number => {
    const sorted = entries.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0]?.[field] ?? 0;
  }, [entries]);

  const lastCarteiraTotal = getLastSnapshotValue('carteiraTotal');
  const lastPrevisaoMesAtual = getLastSnapshotValue('previsaoMesAtual');
  const lastPrevisaoMesSeguinte = getLastSnapshotValue('previsaoMesSeguinte');

  const getAccumSparkline = useCallback((field: NumericField): number[] => {
    const todayDate = new Date();
    const data: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(todayDate);
      dayDate.setDate(todayDate.getDate() - i);
      const dayStr = dayDate.toISOString().split('T')[0];
      const dayEntries = entries.filter((e) => {
        const eDate = new Date(e.date);
        return (
          eDate <= dayDate &&
          eDate.getFullYear() === todayDate.getFullYear() &&
          eDate.getMonth() === todayDate.getMonth()
        );
      });
      data.push(dayEntries.reduce((sum, e) => sum + e[field], 0));
    }
    return data;
  }, [entries]);

  const getPositionSparkline = useCallback((field: NumericField): number[] => {
    const sorted = entries
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);
    return sorted.map((e) => e[field]).reverse();
  }, [entries]);

  const kpiConfigs: KpiConfig[] = useMemo(
    () => [
      {
        label: 'Faturamento',
        value: currentSums.faturamento,
        prefix: 'R$ ',
        color: 'emerald',
        type: 'accum',
        key: 'faturamento',
      },
      {
        label: 'Vendas',
        value: currentSums.vendas,
        prefix: 'R$ ',
        color: 'blue',
        type: 'accum',
        key: 'vendas',
      },
      {
        label: 'Atrasos',
        value: currentSums.atrasos,
        prefix: '',
        color: 'red',
        type: 'accum',
        key: 'atrasos',
      },
      {
        label: 'Carteira Total',
        value: lastCarteiraTotal,
        prefix: 'R$ ',
        color: 'violet',
        type: 'position',
        key: 'carteiraTotal',
      },
      {
        label: 'Previsão Mês Atual',
        value: lastPrevisaoMesAtual,
        prefix: 'R$ ',
        color: 'indigo',
        type: 'position',
        key: 'previsaoMesAtual',
      },
      {
        label: 'Previsão Mês Seguinte',
        value: lastPrevisaoMesSeguinte,
        prefix: 'R$ ',
        color: 'amber',
        type: 'position',
        key: 'previsaoMesSeguinte',
      },
    ],
    [currentSums, lastCarteiraTotal, lastPrevisaoMesAtual, lastPrevisaoMesSeguinte]
  );

  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: typeof value === 'number' ? value : parseFloat(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: DiarioEntry = {
      id: crypto.randomUUID(),
      date: today,
      ...form,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setForm({
      faturamento: 0,
      vendas: 0,
      atrasos: 0,
      carteiraTotal: 0,
      previsaoMesAtual: 0,
      previsaoMesSeguinte: 0,
      observacoes: '',
    });
  };

  const handleMetasChange = (field: keyof Metas, value: string) => {
    setMetasForm((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSaveMetas = () => {
    setMetas(metasForm);
    setShowMetasModal(false);
  };

  const currentMonthName = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const sortedEntries = useMemo(
    () => entries.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries]
  );

  const formFields = [
    { key: 'faturamento' as keyof FormData, label: 'Faturamento (R$)' },
    { key: 'vendas' as keyof FormData, label: 'Vendas (R$)' },
    { key: 'atrasos' as keyof FormData, label: 'Atrasos' },
    { key: 'carteiraTotal' as keyof FormData, label: 'Carteira Total (R$)' },
    { key: 'previsaoMesAtual' as keyof FormData, label: 'Previsão Mês Atual (R$)' },
    { key: 'previsaoMesSeguinte' as keyof FormData, label: 'Previsão Mês Seguinte (R$)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-6 max-w-7xl space-y-16">
        {/* Seção 1 - KPI Cards */}
        <section>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-12 text-center">
            Dashboard Diário
          </h1>
          <div className="grid grid-cols-3 grid-rows-2 gap-8">
            {kpiConfigs.map((kpi, index) => {
              const sparkData =
                kpi.type === 'accum'
                  ? getAccumSparkline(kpi.key)
                  : getPositionSparkline(kpi.key);
              const displayValue =
                kpi.prefix === 'R$ '
                  ? kpi.value.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })
                  : kpi.value.toLocaleString();
              return (
                <Card key={kpi.label} className={glassmorphism}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-white/90">
                      {kpi.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-${kpi.color}-400 to-${kpi.color}-600`}>
                      {displayValue}
                    </div>
                    <Sparkline data={sparkData} className={`text-${kpi.color}-400`} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Resumo Mensal */}
        <section>
          <Card className={glassmorphism + ' col-span-full'}>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Resumo Mensal - {currentMonthName}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-xl font-semibold">Faturamento</div>
                <div className="text-2xl font-bold text-emerald-600">
                  R$ {currentSums.faturamento.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Meta: R$ {metas.faturamento.toLocaleString()}
                </div>
                <Progress
                  value={metas.faturamento > 0 ? Math.min(100, (currentSums.faturamento / metas.faturamento) * 100) : 0}
                  className="h-3"
                />
              </div>
              <div className="space-y-2">
                <div className="text-xl font-semibold">Vendas</div>
                <div className="text-2xl font-bold text-blue-600">
                  R$ {currentSums.vendas.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Meta: R$ {metas.vendas.toLocaleString()}
                </div>
                <Progress
                  value={metas.vendas > 0 ? Math.min(100, (currentSums.vendas / metas.vendas) * 100) : 0}
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <Card className={glassmorphism}>
            <CardHeader>
              <CardTitle className="text-2xl">Registro Diário ({today})</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formFields.map(({ key, label }) => (
                  <div key={key as string} className="space-y-1.5">
                    <Label>{label}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={label}
                      value={form[key as keyof FormData] ?? ''}
                      onChange={(e) => handleFormChange(key as keyof FormData, e.target.value)}
                      className="text-right"
                    />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <Label>Observações</Label>
                  <Input
                    type="text"
                    placeholder="Observações opcionais..."
                    value={form.observacoes}
                    onChange={(e) => handleFormChange('observacoes', e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Registrar Hoje
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Modal Metas Trigger */}
          <Card className={glassmorphism}>
            <CardHeader>
              <CardTitle className="text-2xl">Metas Mensais</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Button
                onClick={() => {
                  setMetasForm(metas);
                  setShowMetasModal(true);
                }}
                className="w-full"
              >
                Gerenciar Metas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Histórico */}
        <section>
          <Card className={glassmorphism}>
            <CardHeader>
              <CardTitle className="text-2xl">Histórico</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedEntries.map((entry) => (
                  <div key={entry.id} className="p-4 border border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm">
                    <div className="font-bold text-lg mb-2">{formatDate(entry.date)}</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                      <div>Fat: R$ {entry.faturamento.toLocaleString()}</div>
                      <div>Ven: R$ {entry.vendas.toLocaleString()}</div>
                      <div>Atr: {entry.atrasos.toLocaleString()}</div>
                      <div>Cart: R$ {entry.carteiraTotal.toLocaleString()}</div>
                      <div>Prev Atual: R$ {entry.previsaoMesAtual.toLocaleString()}</div>
                      <div>Prev Seg: R$ {entry.previsaoMesSeguinte.toLocaleString()}</div>
                    </div>
                    {entry.observacoes && (
                      <div className="mt-2 text-xs italic text-muted-foreground">
                        {entry.observacoes}
                      </div>
                    )}
                  </div>
                ))}
                {sortedEntries.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum registro ainda.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Modal Metas */}
      <Dialog open={showMetasModal} onOpenChange={setShowMetasModal}>
        <DialogContent className="max-w-md backdrop-blur-2xl bg-white/90">
          <DialogHeader>
            <DialogTitle>Definir Metas Mensais</DialogTitle>
            <DialogDescription>Metas para o mês atual.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Faturamento (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={metasForm.faturamento}
                onChange={(e) => handleMetasChange('faturamento', e.target.value)}
                className="text-right"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vendas (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={metasForm.vendas}
                onChange={(e) => handleMetasChange('vendas', e.target.value)}
                className="text-right"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMetasModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMetas}>Salvar Metas</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
