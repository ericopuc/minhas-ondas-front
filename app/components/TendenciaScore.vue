<script setup>
/*
  Mini-gráfico (sparkline) da tendência do score nas próximas horas, com a
  indicação se vai melhorar, piorar ou ficar estável até o próximo horário
  de interesse (marcado com um ponto)
*/
const props = defineProps({
  tendencia: { type: Object, required: true },
});

const LARGURA = 104;
const ALTURA = 30;
const MARGEM = 3;

const INDICADORES = {
  melhora: { seta: '↗', texto: 'melhora', classe: 'text-[hsl(125,80%,60%)]' },
  piora: { seta: '↘', texto: 'piora', classe: 'text-perigo' },
  estavel: { seta: '→', texto: 'estável', classe: 'text-oceano-300' },
};

// coordenadas de cada ponto; scores nulos ficam fora do desenho
const pontos = computed(() => {
  const lista = props.tendencia.pontos;
  const passo = (LARGURA - MARGEM * 2) / Math.max(lista.length - 1, 1);
  return lista.map((ponto, indice) => ({
    ...ponto,
    x: MARGEM + indice * passo,
    y: ponto.score === null ? null : MARGEM + (1 - ponto.score / 10) * (ALTURA - MARGEM * 2),
  }));
});

// um trecho por par de pontos, colorido pelo score médio
const trechos = computed(() => pontos.value.slice(1)
  .map((ponto, indice) => ({ inicio: pontos.value[indice], fim: ponto }))
  .filter(({ inicio, fim }) => inicio.y !== null && fim.y !== null));

const proximo = computed(() => pontos.value
  .find((ponto) => ponto.hora === props.tendencia.proximo_horario && ponto.y !== null));

const indicador = computed(() => INDICADORES[props.tendencia.direcao]);

const variacaoTexto = computed(() => {
  const { variacao } = props.tendencia;
  return variacao > 0 ? `+${formatarScore(variacao)}` : formatarScore(variacao);
});
</script>

<template>
  <div
    class="flex flex-col items-end gap-0.5"
    :title="`Tendência: ${indicador.texto} (${variacaoTexto}) até ${tendencia.rotulo_proximo.toLowerCase()}`"
  >
    <svg :width="LARGURA" :height="ALTURA" :viewBox="`0 0 ${LARGURA} ${ALTURA}`" aria-hidden="true">
      <line :x1="MARGEM" :x2="LARGURA - MARGEM" :y1="ALTURA / 2" :y2="ALTURA / 2" stroke="#1b3254" stroke-dasharray="2 3" />
      <line
        v-for="trecho in trechos"
        :key="trecho.inicio.hora"
        :x1="trecho.inicio.x" :y1="trecho.inicio.y" :x2="trecho.fim.x" :y2="trecho.fim.y"
        :stroke="corDoScore((trecho.inicio.score + trecho.fim.score) / 2)"
        stroke-width="2"
        stroke-linecap="round"
      />
      <circle v-if="proximo" :cx="proximo.x" :cy="proximo.y" r="3" fill="#ffffff" />
    </svg>
    <p class="numeros text-[11px] font-semibold" :class="indicador.classe">
      {{ indicador.seta }} {{ indicador.texto }} {{ variacaoTexto }}
      <span class="font-normal text-oceano-400">até {{ formatarHora(tendencia.proximo_horario) }}</span>
    </p>
    <span class="sr-only">Tendência: {{ indicador.texto }} de {{ variacaoTexto }} pontos até {{ tendencia.rotulo_proximo }}</span>
  </div>
</template>
