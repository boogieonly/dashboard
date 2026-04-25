type MetricKey = 'faturamento' | 'vendas' | 'atrasos' | 'carteira' | 'previsaoAtual' | 'previsaoProx';

const metricsNames: MetricKey[] = ['faturamento', 'vendas', 'atrasos', 'carteira', 'previsaoAtual', 'previsaoProx'];

const metricNames: Record<MetricKey, string> = {
  faturamento: 'Faturamento',
  vendas: 'Vendas',
  atrasos: 'Atrasos',
  carteira: 'Carteira',
  previsaoAtual: 'Previsão Atual',
  previsaoProx: 'Previsão Próx'
};

const metricEmojis: Record<MetricKey, string> = {
  faturamento: '💰',
  vendas: '📈',
  atrasos: '⚠️',
  carteira: '💼',
  previsaoAtual: '🔮',
  previsaoProx: '📈'
};

interface DailyData {
  date: string;
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteira: number;
  previsaoAtual: number;
  previsaoProx: number;
}

type Metrics = {
  faturamento: number;
  vendas: number;
  atrasos: number;
  carteira: number;
  previsaoAtual: number;
  previsaoProx: number;
};

interface KpiCardEls {
  valueEl: HTMLDivElement;
  changeEl: HTMLDivElement;
  progressBar: HTMLDivElement;
  canvas: HTMLCanvasElement;
}

let data: DailyData[] = [];
let targets: Partial<Metrics> = {};
let kpiCards: Partial<Record<MetricKey, KpiCardEls>> = {};

const STORAGE_KEY = 'dashboardData';
const TARGETS_KEY = 'dashboardTargets';

const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
};

const getMonthStart = (dateStr: string): string => {
  const [year, month] = dateStr.split('-');
  return `${year}-${month.padStart(2, '0')}-01`;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatValue = (key: MetricKey, val: number): string => {
  const currencyKeys: MetricKey[] = ['faturamento', 'carteira', 'previsaoAtual', 'previsaoProx'];
  return currencyKeys.includes(key) ? formatCurrency(val) : val.toLocaleString('pt-BR');
};

const getTodayStr = (): string => {
  const now = new Date();
  return [
    now.getFullYear().toString(),
    (now.getMonth() + 1).toString().padStart(2, '0'),
    now.getDate().toString().padStart(2, '0')
  ].join('-');
};

const subtractDays = (dateStr: string, days: number): string => {
  const parts = dateStr.split('-').map(Number);
  const tempDate = new Date(parts[0], parts[1] - 1, parts[2]);
  tempDate.setDate(tempDate.getDate() - days);
  return [
    tempDate.getFullYear().toString(),
    (tempDate.getMonth() + 1).toString().padStart(2, '0'),
    tempDate.getDate().toString().padStart(2, '0')
  ].join('-');
};

const last7Days = (): string[] => {
  const today = getTodayStr();
  return Array.from({ length: 7 }, (_, i) => subtractDays(today, 6 - i));
};

const incrementMonth = (dateStr: string): string => {
  let [year, month] = dateStr.split('-').map(Number);
  month++;
  if (month > 12) {
    month = 1;
    year++;
  }
  return `${year}-${month.toString().padStart(2, '0')}-01`;
};

const getPrevMonthStart = (dateStr: string): string => {
  let [year, month] = dateStr.split('-').map(Number);
  month--;
  if (month < 1) {
    month = 12;
    year--;
  }
  return `${year}-${month.toString().padStart(2, '0')}-01`;
};

const getMonthMetrics = (monthStart: string): Metrics => {
  const nextMonthStart = incrementMonth(monthStart);
  const periodData = data.filter(d => d.date >= monthStart && d.date < nextMonthStart);
  const sums: Metrics = {
    faturamento: 0,
    vendas: 0,
    atrasos: 0,
    carteira: 0,
    previsaoAtual: 0,
    previsaoProx: 0
  };
  periodData.forEach(d => {
    sums.faturamento += d.faturamento;
    sums.vendas += d.vendas;
    sums.atrasos += d.atrasos;
  });
  if (periodData.length > 0) {
    const last = periodData[periodData.length - 1];
    sums.carteira = last.carteira;
    sums.previsaoAtual = last.previsaoAtual;
    sums.previsaoProx = last.previsaoProx;
  }
  return sums;
};

const getLast7Values = (key: MetricKey): number[] => {
  const dates = last7Days();
  return dates.map(date => data.find(d => d.date === date)?.[key] ?? 0);
};

const getSparkColor = (key: MetricKey): string => {
  const colors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#00bcd4'];
  return colors[metricsNames.indexOf(key)];
};

const drawSparkline = (canvas: HTMLCanvasElement, values: number[], color: string): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const max = Math.max(1, ...values);
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  values.forEach((value, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - (value / max) * (height - 4) + 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
};

const loadData = (): void => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    data = JSON.parse(stored);
  } else {
    const today = getTodayStr();
    for (let i = 13; i >= 0; i--) {
      const date = subtractDays(today, i);
      data.push({
        date,
        faturamento: 5000 + Math.floor(Math.random() * 5000),
        vendas: 5 + Math.floor(Math.random() * 10),
        atrasos: Math.floor(Math.random() * 5),
        carteira: 40000 + Math.floor(Math.random() * 20000),
        previsaoAtual: 10000 + Math.floor(Math.random() * 5000),
        previsaoProx: 12000 + Math.floor(Math.random() * 5000)
      });
    }
    const pMonthStart = getPrevMonthStart(getMonthStart(today));
    for (let i = 0; i < 10; i--) {
      const date = subtractDays(pMonthStart, 29 - i); // spread in prev month
      data.push({
        date,
        faturamento: 4000 + Math.floor(Math.random() * 3000),
        vendas: 4 + Math.floor(Math.random() * 6),
        atrasos: Math.floor(Math.random() * 4),
        carteira: 35000 + Math.floor(Math.random() * 15000),
        previsaoAtual: 9000 + Math.floor(Math.random() * 4000),
        previsaoProx: 11000 + Math.floor(Math.random() * 4000)
      });
    }
    saveData();
  }
};

const loadTargets = (): void => {
  const stored = localStorage.getItem(TARGETS_KEY);
  if (stored) {
    targets = JSON.parse(stored);
  } else {
    targets = {
      faturamento: 60000,
      vendas: 60,
      atrasos: 10,
      carteira: 70000,
      previsaoAtual: 20000,
      previsaoProx: 25000
    };
    localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
  }
};

const saveData = (): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const saveTargets = (): void => {
  localStorage.setItem(TARGETS_KEY, JSON.stringify(targets));
};

const createUI = (): void => {
  // Styles
  const style = document.createElement('style');
  style.textContent = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .kpi-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); }
    .kpi-header { display: flex; align-items: center; margin-bottom: 12px; }
    .kpi-name { font-size: 1.1em; font-weight: 600; margin-left: 8px; color: #555; }
    .kpi-value { font-size: 2.8em; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; }
    .kpi-change { font-size: 0.95em; font-weight: 500; display: flex; align-items: center; }
    .change-positive { color: #4caf50; }
    .change-negative { color: #f44336; }
    .sparkline { width: 100%; height: 32px; margin-top: 16px; }
    .progress { height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; margin-top: 12px; }
    .progress-bar { height: 100%; background: linear-gradient(90deg, #4caf50, #81c784); transition: width 0.3s ease; border-radius: 4px; }
    .form-section { background: white; padding: 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .form-group { display: flex; flex-direction: column; }
    .form-group label { font-weight: 600; margin-bottom: 6px; color: #555; }
    input[type="date"], input[type="number"] { padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 1em; }
    input:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 2px rgba(0,123,255,0.25); }
    button { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1em; font-weight: 500; transition: background 0.2s; }
    button:hover { background: #0056b3; }
    .btn-group { display: flex; gap: 12px; flex-wrap: wrap; }
    table { width: 100%; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 20px; }
    th, td { padding: 12px 16px; text-align: right; }
    th { background: #f8f9fa; font-weight: 600; color: #555; }
    .date-col { text-align: left !important; font-weight: 500; }
    .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; }
    .modal-content { background: white; margin: 20px; padding: 32px; max-width: 600px; width: 90%; border-radius: 12px; max-height: 90vh; overflow-y: auto; }
    .hidden { display: none; }
  `;
  document.head.appendChild(style);

  // KPI Grid
  const kpiGrid = document.createElement('div');
  kpiGrid.className = 'kpi-grid';
  metricsNames.forEach((key) => {
    const card = document.createElement('div');
    card.className = 'kpi-card';
    card.id = `card-${key}`;
    const header = document.createElement('div');
    header.className = 'kpi-header';
    const emojiSpan = document.createElement('span');
    emojiSpan.textContent = metricEmojis[key];
    const nameSpan = document.createElement('span');
    nameSpan.className = 'kpi-name';
    nameSpan.textContent = metricNames[key];
    header.append(emojiSpan, nameSpan);
    const valueEl = document.createElement('div');
    valueEl.className = 'kpi-value';
    const changeEl = document.createElement('div');
    changeEl.className = 'kpi-change';
    const progressDiv = document.createElement('div');
    progressDiv.className = 'progress';
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressDiv.appendChild(progressBar);
    const canvas = document.createElement('canvas');
    canvas.className = 'sparkline';
    canvas.width = 200;
    canvas.height = 32;
    card.append(header, valueEl, changeEl, progressDiv, canvas);
    kpiGrid.appendChild(card);
    kpiCards[key] = { valueEl: valueEl as HTMLDivElement, changeEl: changeEl as HTMLDivElement, progressBar, canvas };
  });
  document.body.appendChild(kpiGrid);

  // Form
  const formSection = document.createElement('div');
  formSection.className = 'form-section';
  const formTitle = document.createElement('h2');
  formTitle.textContent = '📊 Adicionar/Editar Dados Diários';
  const formGrid = document.createElement('div');
  formGrid.className = 'form-grid';
  // Date input
  const dateGroup = document.createElement('div');
  dateGroup.className = 'form-group';
  const dateLabel = document.createElement('label');
  dateLabel.textContent = '📅 Data';
  const dateInput = document.createElement('input');
  dateInput.id = 'input-date';
  dateInput.type = 'date';
  dateGroup.append(dateLabel, dateInput);
  formGrid.appendChild(dateGroup);
  // Metrics inputs
  metricsNames.forEach((key) => {
    const group = document.createElement('div');
    group.className = 'form-group';
    const label = document.createElement('label');
    label.textContent = `${metricEmojis[key]} ${metricNames[key]}`;
    const input = document.createElement('input');
    input.id = `input-${key}`;
    input.type = 'number';
    input.step = 'any';
    input.min = '0';
    group.append(label, input);
    formGrid.appendChild(group);
  });
  const addBtn = document.createElement('button');
  addBtn.textContent = '➕ Adicionar/Atualizar';
  addBtn.onclick = handleAdd;
  formSection.append(formTitle, formGrid, addBtn);
  document.body.appendChild(formSection);

  // History
  const historyBtn = document.createElement('button');
  historyBtn.textContent = '📋 Toggle Histórico';
  historyBtn.onclick = toggleHistory;
  document.body.appendChild(historyBtn);
  const historyTable = document.createElement('table');
  historyTable.id = 'history-table';
  historyTable.className = 'hidden';
  const thead = document.createElement('thead');
  const headTr = document.createElement('tr');
  ['Data', ...metricsNames.map((k) => metricNames[k])].forEach((name, idx) => {
    const th = document.createElement('th');
    th.textContent = name;
    if (idx === 0) th.className = 'date-col';
    headTr.appendChild(th);
  });
  thead.appendChild(headTr);
  const tbody = document.createElement('tbody');
  historyTable.append(thead, tbody);
  document.body.appendChild(historyTable);

  // Modal Metas
  const metasBtn = document.createElement('button');
  metasBtn.textContent = '🎯 Gerenciar Metas';
  metasBtn.onclick = () => openModal();
  document.body.appendChild(metasBtn);
  const modal = document.createElement('div');
  modal.id = 'modal-metas';
  modal.className = 'modal';
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  const modalTitle = document.createElement('h2');
  modalTitle.textContent = '🎯 Definir Metas Mensais';
  const modalGrid = document.createElement('div');
  modalGrid.className = 'form-grid';
  metricsNames.forEach((key) => {
    const group = document.createElement('div');
    group.className = 'form-group';
    const label = document.createElement('label');
    label.textContent = `${metricEmojis[key]} ${metricNames[key]}`;
    const input = document.createElement('input');
    input.id = `target-input-${key}`;
    input.type = 'number';
    input.step = 'any';
    input.min = '0';
    group.append(label, input);
    modalGrid.appendChild(group);
  });
  const modalBtnGroup = document.createElement('div');
  modalBtnGroup.className = 'btn-group';
  const saveModalBtn = document.createElement('button');
  saveModalBtn.textContent = '💾 Salvar';
  saveModalBtn.onclick = handleSaveTargets;
  const closeModalBtn = document.createElement('button');
  closeModalBtn.textContent = '❌ Fechar';
  closeModalBtn.onclick = () => closeModal();
  modalBtnGroup.append(saveModalBtn, closeModalBtn);
  modalContent.append(modalTitle, modalGrid, modalBtnGroup);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Set default form date
  (document.getElementById('input-date') as HTMLInputElement).value = getTodayStr();
};

const render = (): void => {
  const today = getTodayStr();
  const monthStart = getMonthStart(today);
  const currentMetrics = getMonthMetrics(monthStart);
  const prevMonthStart = getPrevMonthStart(monthStart);
  const prevMetrics = getMonthMetrics(prevMonthStart);
  metricsNames.forEach((key) => {
    const card = kpiCards[key];
    if (!card) return;
    card.valueEl.textContent = formatValue(key, currentMetrics[key]);
    const prevVal = prevMetrics[key];
    let changePerc = 0;
    if (prevVal > 0) {
      changePerc = ((currentMetrics[key] - prevVal) / prevVal) * 100;
    }
    card.changeEl.innerHTML = '';
    const icon = changePerc >= 0 ? '▲' : '▼';
    const cls = changePerc >= 0 ? 'change-positive' : 'change-negative';
    const changeSpan = document.createElement('span');
    changeSpan.className = cls;
    changeSpan.innerHTML = `${icon} ${changePerc.toFixed(1)}%`;
    card.changeEl.appendChild(changeSpan);
    // Progress
    const targetVal = targets[key];
    if (targetVal && targetVal > 0) {
      const progress = Math.min(100, (currentMetrics[key] / targetVal) * 100);
      card.progressBar.style.width = `${progress}%`;
      card.progressBar.title = `${progress.toFixed(1)}% da meta`;
    } else {
      card.progressBar.style.width = '0%';
      card.progressBar.title = '';
    }
    // Sparkline
    const sparkData = getLast7Values(key);
    drawSparkline(card.canvas, sparkData, getSparkColor(key));
  });
  // History table
  const tbody = document.querySelector('#history-table tbody') as HTMLTableSectionElement;
  if (tbody) {
    tbody.innerHTML = '';
    const sortedData = [...data].sort((a, b) => b.date.localeCompare(a.date));
    sortedData.forEach((entry) => {
      const tr = document.createElement('tr');
      const dateTd = document.createElement('td');
      dateTd.className = 'date-col';
      dateTd.textContent = formatDate(entry.date);
      tr.appendChild(dateTd);
      metricsNames.forEach((key) => {
        const td = document.createElement('td');
        td.textContent = formatValue(key, entry[key]);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }
};

const handleAdd = (): void => {
  const dateInput = document.getElementById('input-date') as HTMLInputElement;
  const dateStr = dateInput.value;
  if (!dateStr) {
    alert('Por favor, selecione uma data.');
    return;
  }
  const entry: DailyData = { date: dateStr, faturamento: 0, vendas: 0, atrasos: 0, carteira: 0, previsaoAtual: 0, previsaoProx: 0 };
  let isValid = true;
  metricsNames.forEach((key) => {
    const inputEl = document.getElementById(`input-${key}`) as HTMLInputElement;
    const val = parseFloat(inputEl.value);
    if (isNaN(val) || val < 0) {
      isValid = false;
      return;
    }
    (entry as any)[key] = val;
  });
  if (!isValid) {
    alert('Por favor, insira valores numéricos válidos (≥ 0).');
    return;
  }
  const index = data.findIndex((d) => d.date === dateStr);
  if (index >= 0) {
    data[index] = entry;
  } else {
    data.push(entry);
  }
  data.sort((a, b) => a.date.localeCompare(b.date));
  saveData();
  render();
  // Clear form
  metricsNames.forEach((key) => {
    (document.getElementById(`input-${key}`) as HTMLInputElement).value = '';
  });
  dateInput.value = getTodayStr();
};

const toggleHistory = (): void => {
  const table = document.getElementById('history-table') as HTMLElement;
  table.classList.toggle('hidden');
};

const openModal = (): void => {
  metricsNames.forEach((key) => {
    const input = document.getElementById(`target-input-${key}`) as HTMLInputElement;
    input.value = targets[key]?.toString() ?? '';
  });
  (document.getElementById('modal-metas') as HTMLElement).style.display = 'flex';
};

const closeModal = (): void => {
  (document.getElementById('modal-metas') as HTMLElement).style.display = 'none';
};

const handleSaveTargets = (): void => {
  metricsNames.forEach((key) => {
    const input = document.getElementById(`target-input-${key}`) as HTMLInputElement;
    const val = parseFloat(input.value);
    if (!isNaN(val) && val > 0) {
      targets[key] = val;
    } else {
      delete targets[key];
    }
  });
  saveTargets();
  render();
  closeModal();
};

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  loadTargets();
  createUI();
  render();
});
