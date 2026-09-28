<script setup>
/*
  Gráfico da evolução do score (0-10), com a linha colorida pelo próprio score
*/
import { Line } from 'vue-chartjs';

const props = defineProps({
  horas: { type: Array, required: true },
  indiceAgora: { type: Number, default: null },
});

const rotulos = computed(() => props.horas.map((h) => h.hora));

const dados = computed(() => ({
  labels: rotulos.value,
  datasets: [{
    data: props.horas.map((h) => h.score),
    borderWidth: 2.5,
    tension: 0.35,
    pointRadius: 0,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: (contexto) => corDoScore(contexto.raw),
    // cada trecho da linha recebe a cor do score médio entre os dois pontos
    segment: {
      borderColor: (contexto) => corDoScore((contexto.p0.parsed.y + contexto.p1.parsed.y) / 2),
    },
    spanGaps: true,
  }],
}));

const opcoes = computed(() => {
  const base = opcoesBase(rotulos.value, props.indiceAgora, { min: 0, max: 10 });
  base.plugins.tooltip.callbacks.label = (item) => {
    const hora = props.horas[item.dataIndex];
    const fatores = hora.fatores ?? {};
    return [
      ` Score: ${formatarScore(item.raw)} (${rotuloDoScore(item.raw)})`,
      ` Tamanho ${formatarScore(fatores.tamanho)} · Período ${formatarScore(fatores.periodo)}`,
      ` Direção ${formatarScore(fatores.direcao)} · Vento ${formatarScore(fatores.vento)}`,
    ];
  };
  return base;
});
</script>

<template>
  <div class="h-56">
    <Line :data="dados" :options="opcoes" :plugins="[pluginLinhaAgora]" />
  </div>
</template>
