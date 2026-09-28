<script setup>
/*
  Círculo com o score (0-10) na cor do gradiente vermelho → amarelo → verde
*/
defineProps({
  score: { type: Number, default: null },
  tamanho: { type: String, default: 'md' },
});

const classesTamanho = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-base',
  lg: 'h-20 w-20 text-3xl',
};
</script>

<template>
  <div
    class="numeros flex shrink-0 items-center justify-center rounded-full font-bold text-oceano-950"
    :class="classesTamanho[tamanho]"
    :style="{ backgroundColor: corDoScore(score) }"
    :title="`Score ${formatarScore(score)}: ${rotuloDoScore(score)}`"
  >
    {{ formatarScore(score) }}
  </div>
</template>
