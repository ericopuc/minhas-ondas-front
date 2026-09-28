<script setup>
/*
  Seta que indica para onde a ondulação/o vento VAI. A direção recebida segue a
  convenção meteorológica (de onde VEM), por isso a seta gira 180° a mais.
*/
const props = defineProps({
  graus: { type: Number, default: null },
  tamanho: { type: Number, default: 16 },
});

const rotacao = computed(() => ((props.graus ?? 0) + 180) % 360);
</script>

<template>
  <svg
    v-if="graus !== null"
    :width="tamanho"
    :height="tamanho"
    viewBox="0 0 24 24"
    class="inline-block shrink-0"
    :style="{ transform: `rotate(${rotacao}deg)` }"
    aria-hidden="true"
  >
    <path d="M12 3 L18 19 L12 15 L6 19 Z" fill="currentColor" />
  </svg>
</template>
