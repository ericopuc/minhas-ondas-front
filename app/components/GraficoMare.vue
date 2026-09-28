<script setup>
/*
  Gráfico da tábua de maré (nível do mar em relação à média, em metros)
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
    data: props.horas.map((h) => h.mare),
    borderColor: '#5cc8ff',
    backgroundColor: 'rgba(92, 200, 255, 0.12)',
    borderWidth: 2,
    fill: 'origin',
    tension: 0.4,
    pointRadius: 0,
    pointHoverRadius: 4,
  }],
}));

const opcoes = computed(() => {
  const base = opcoesBase(rotulos.value, props.indiceAgora, {
    ticks: { color: '#a7bad4', font: { size: 11 }, callback: (valor) => `${valor.toFixed(1)} m` },
  });
  base.plugins.tooltip.callbacks.label = (item) => ` Maré: ${formatarNumero(item.raw, 2, 'm')}`;
  return base;
});
</script>

<template>
  <div class="h-56">
    <Line :data="dados" :options="opcoes" :plugins="[pluginLinhaAgora]" />
  </div>
</template>
