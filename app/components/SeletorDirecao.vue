<script setup>
/*
  Seletor giratório de direção (0-360°). Arraste o ponteiro, clique em um ponto
  cardeal ou use as setas do teclado (Shift = passos de 22,5°).
  O valor é a direção de onde a ondulação/o vento VEM.
*/
const modelo = defineModel({ type: Number, default: 0 });

defineProps({
  rotulo: { type: String, required: true },
  cor: { type: String, default: '#5cc8ff' },
});

const PASSO = 5;
const CENTRO = 90;
const RAIO = 72;
const CARDEAIS = [
  { nome: 'N', graus: 0 }, { nome: 'NE', graus: 45 }, { nome: 'L', graus: 90 },
  { nome: 'SE', graus: 135 }, { nome: 'S', graus: 180 }, { nome: 'SO', graus: 225 },
  { nome: 'O', graus: 270 }, { nome: 'NO', graus: 315 },
];

const dial = ref(null);
const arrastando = ref(false);

const normalizar = (graus) => ((Math.round(graus / PASSO) * PASSO) % 360 + 360) % 360;

// posição (x, y) de um ângulo no círculo, com 0° no topo e sentido horário
const ponto = (graus, raio) => {
  const rad = (graus * Math.PI) / 180;
  return { x: CENTRO + raio * Math.sin(rad), y: CENTRO - raio * Math.cos(rad) };
};

const marcas = Array.from({ length: 36 }, (_, i) => {
  const graus = i * 10;
  const longa = graus % 45 === 0;
  return { graus, inicio: ponto(graus, RAIO - (longa ? 10 : 5)), fim: ponto(graus, RAIO) };
});

const ponteiro = computed(() => ponto(modelo.value, RAIO - 16));

const atualizarPeloPonteiro = (evento) => {
  const caixa = dial.value.getBoundingClientRect();
  const dx = evento.clientX - (caixa.left + caixa.width / 2);
  const dy = evento.clientY - (caixa.top + caixa.height / 2);
  modelo.value = normalizar((Math.atan2(dx, -dy) * 180) / Math.PI);
};

const iniciarArraste = (evento) => {
  arrastando.value = true;
  evento.currentTarget.setPointerCapture(evento.pointerId);
  atualizarPeloPonteiro(evento);
};

const mover = (evento) => {
  if (arrastando.value) atualizarPeloPonteiro(evento);
};

const terminarArraste = () => {
  arrastando.value = false;
};

const teclado = (evento) => {
  const passo = evento.shiftKey ? 22.5 : PASSO;
  if (['ArrowRight', 'ArrowUp'].includes(evento.key)) {
    modelo.value = normalizar(modelo.value + passo);
    evento.preventDefault();
  } else if (['ArrowLeft', 'ArrowDown'].includes(evento.key)) {
    modelo.value = normalizar(modelo.value - passo);
    evento.preventDefault();
  }
};
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <span class="rotulo">{{ rotulo }}</span>
    <svg
      ref="dial"
      viewBox="0 0 180 180"
      class="h-40 w-40 cursor-grab touch-none select-none rounded-full focus-visible:outline-2 focus-visible:outline-acento"
      :class="{ 'cursor-grabbing': arrastando }"
      role="slider"
      tabindex="0"
      :aria-label="rotulo"
      aria-valuemin="0"
      aria-valuemax="359"
      :aria-valuenow="modelo"
      :aria-valuetext="`${direcaoCardinal(modelo)}, ${modelo} graus`"
      @pointerdown="iniciarArraste"
      @pointermove="mover"
      @pointerup="terminarArraste"
      @pointercancel="terminarArraste"
      @keydown="teclado"
    >
      <circle :cx="CENTRO" :cy="CENTRO" :r="RAIO + 6" fill="#050d1a" stroke="#1b3254" stroke-width="2" />
      <line
        v-for="marca in marcas"
        :key="marca.graus"
        :x1="marca.inicio.x" :y1="marca.inicio.y" :x2="marca.fim.x" :y2="marca.fim.y"
        :stroke="marca.graus % 45 === 0 ? '#a7bad4' : '#28466f'"
        stroke-width="2"
        stroke-linecap="round"
      />
      <text
        v-for="cardeal in CARDEAIS"
        :key="cardeal.nome"
        :x="ponto(cardeal.graus, RAIO - 22).x"
        :y="ponto(cardeal.graus, RAIO - 22).y"
        text-anchor="middle"
        dominant-baseline="central"
        class="cursor-pointer text-[11px] font-semibold"
        :fill="direcaoCardinal(modelo) === cardeal.nome ? '#ffffff' : '#7890b3'"
        @pointerdown.stop="modelo = cardeal.graus"
      >
        {{ cardeal.nome }}
      </text>
      <line
        :x1="CENTRO" :y1="CENTRO" :x2="ponteiro.x" :y2="ponteiro.y"
        :stroke="cor" stroke-width="4" stroke-linecap="round"
      />
      <circle :cx="ponteiro.x" :cy="ponteiro.y" r="7" :fill="cor" stroke="#050d1a" stroke-width="2" />
      <circle :cx="CENTRO" :cy="CENTRO" r="24" fill="#0a1628" stroke="#1b3254" />
      <text :x="CENTRO" :y="CENTRO - 5" text-anchor="middle" dominant-baseline="central" fill="#fff" class="text-[15px] font-bold">
        {{ direcaoCardinal(modelo) }}
      </text>
      <text :x="CENTRO" :y="CENTRO + 10" text-anchor="middle" dominant-baseline="central" fill="#a7bad4" class="numeros text-[10px]">
        {{ modelo }}°
      </text>
    </svg>
  </div>
</template>
