/*
  --------------------------------------------------------------------------------------
  Configuração compartilhada dos gráficos (Chart.js)
  --------------------------------------------------------------------------------------
*/
import {
  Chart, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip,
} from 'chart.js';

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

/*
  Plugin que desenha uma linha vertical na hora atual
*/
export const pluginLinhaAgora = {
  id: 'linhaAgora',
  afterDatasetsDraw(grafico, _args, opcoes) {
    const indice = opcoes?.indice;
    if (indice === null || indice === undefined || indice < 0) return;
    const { ctx, chartArea, scales } = grafico;
    const x = scales.x.getPixelForValue(indice);
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillText('agora', x + 4, chartArea.top + 10);
    ctx.restore();
  },
};

/*
  Opções base: eixo x com um rótulo por dia (à meia-noite), tema escuro
*/
export const opcoesBase = (horas, indiceAgora, eixoY = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: {
      grid: {
        color: (contexto) => (horas[contexto.index]?.endsWith('T00:00') ? 'rgba(167, 186, 212, 0.18)' : 'transparent'),
      },
      ticks: {
        color: '#a7bad4',
        autoSkip: false,
        maxRotation: 0,
        font: { size: 11 },
        callback: (_valor, indice) => (horas[indice]?.endsWith('T12:00') ? formatarDia(horas[indice]) : ''),
      },
    },
    y: {
      grid: { color: 'rgba(40, 70, 111, 0.45)' },
      ticks: { color: '#a7bad4', font: { size: 11 } },
      ...eixoY,
    },
  },
  plugins: {
    legend: { display: false },
    linhaAgora: { indice: indiceAgora },
    tooltip: {
      backgroundColor: '#0a1628',
      borderColor: '#28466f',
      borderWidth: 1,
      titleColor: '#ffffff',
      bodyColor: '#d3deec',
      padding: 10,
      callbacks: {
        title: (itens) => {
          const hora = horas[itens[0].dataIndex];
          return `${formatarDia(hora)} · ${formatarHora(hora)}`;
        },
      },
    },
  },
});
