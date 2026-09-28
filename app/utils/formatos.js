/*
  --------------------------------------------------------------------------------------
  Funções de formatação usadas em toda a interface (auto-importadas pelo Nuxt)
  --------------------------------------------------------------------------------------
*/

// rosa dos ventos com 16 pontos, em português (L = leste, O = oeste)
const PONTOS_CARDEAIS = [
  'N', 'NNE', 'NE', 'ENE', 'L', 'ESE', 'SE', 'SSE',
  'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO',
];

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/*
  Cor do score (0 a 10): gradiente vermelho (0) → amarelo (5) → verde (10)
*/
export const corDoScore = (score) => {
  if (score === null || score === undefined) return '#3d5f8e';
  const limitado = Math.max(0, Math.min(10, score));
  return `hsl(${Math.round(limitado * 12.5)}, 80%, 52%)`;
};

/*
  Score com uma casa decimal: "7,3" (ou "—" sem dados)
*/
export const formatarScore = (score) => {
  if (score === null || score === undefined) return '—';
  return Number(score).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

/*
  Rótulo textual do score
*/
export const rotuloDoScore = (score) => {
  if (score === null || score === undefined) return 'Sem dados';
  if (score >= 8) return 'Excelente';
  if (score >= 6) return 'Bom';
  if (score >= 4) return 'Regular';
  if (score >= 2) return 'Ruim';
  return 'Péssimo';
};

/*
  Converte graus (0-360) em ponto cardeal
*/
export const direcaoCardinal = (graus) => {
  if (graus === null || graus === undefined) return '—';
  const indice = Math.round((((graus % 360) + 360) % 360) / 22.5) % 16;
  return PONTOS_CARDEAIS[indice];
};

/*
  Formata um número com casas decimais fixas e unidade opcional
*/
export const formatarNumero = (valor, casas = 1, unidade = '') => {
  if (valor === null || valor === undefined) return '—';
  const texto = Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
  return unidade ? `${texto} ${unidade}` : texto;
};

/*
  Converte "2026-09-27T09:00" em Date local (sem conversão de fuso)
*/
export const lerHora = (iso) => {
  const [data, hora] = iso.split('T');
  const [ano, mes, dia] = data.split('-').map(Number);
  const [h, m] = hora.split(':').map(Number);
  return new Date(ano, mes - 1, dia, h, m || 0);
};

/*
  "09h" a partir da hora ISO
*/
export const formatarHora = (iso) => `${iso.slice(11, 13)}h`;

/*
  "seg 28/09" a partir da hora ISO
*/
export const formatarDia = (iso) => {
  const data = lerHora(iso);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${DIAS_SEMANA[data.getDay()]} ${dia}/${mes}`;
};

/*
  Descrição relativa: "hoje", "amanhã" ou o dia da semana
*/
export const diaRelativo = (iso) => {
  const data = lerHora(iso);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(data);
  alvo.setHours(0, 0, 0, 0);
  const diferenca = Math.round((alvo - hoje) / 86400000);
  if (diferenca === 0) return 'hoje';
  if (diferenca === 1) return 'amanhã';
  if (diferenca === -1) return 'ontem';
  return formatarDia(iso);
};
