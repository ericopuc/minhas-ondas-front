<script setup>
/*
  Lista dos picos em formato texto/símbolo, fixa no momento padrão (o primeiro
  do seletor: "agora" entre 6h e 16h; fora disso, o próximo horário de
  interesse), com a tendência do score para o próximo período
*/
defineProps({
  picos: { type: Array, default: () => [] },
  rotuloMomento: { type: String, default: '' },
  selecionadoId: { type: Number, default: null },
  carregando: { type: Boolean, default: false },
});

const emit = defineEmits(['selecionar', 'editar', 'remover']);
</script>

<template>
  <section class="painel flex min-h-0 flex-1 flex-col">
    <header class="flex items-center justify-between border-b border-oceano-700/70 px-5 py-3">
      <h2 class="text-sm font-semibold text-espuma">
        Meus picos
        <span v-if="rotuloMomento" class="ml-1 font-normal text-oceano-400">· {{ rotuloMomento }}</span>
      </h2>
      <span class="numeros text-xs text-oceano-400">{{ picos.length }} {{ picos.length === 1 ? 'pico' : 'picos' }}</span>
    </header>

    <div v-if="carregando && !picos.length" class="flex flex-1 items-center justify-center p-8 text-sm text-oceano-400">
      Carregando picos…
    </div>

    <div v-else-if="!picos.length" class="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <p class="font-semibold text-espuma">Nenhum pico cadastrado</p>
      <p class="text-sm text-oceano-400">Use “Novo pico” e clique no mapa para adicionar o primeiro.</p>
    </div>

    <ul v-else class="min-h-0 flex-1 divide-y divide-oceano-700/60 overflow-y-auto">
      <li
        v-for="pico in picos"
        :key="pico.id"
        class="group flex cursor-pointer items-center gap-4 px-5 py-4 transition hover:bg-oceano-800/70"
        :class="{ 'bg-oceano-800': pico.id === selecionadoId }"
        tabindex="0"
        @click="emit('selecionar', pico.id)"
        @keydown.enter="emit('selecionar', pico.id)"
      >
        <BadgeScore :score="pico.condicao_momento?.score ?? null" />

        <div class="min-w-0 flex-1">
          <div class="flex items-baseline gap-2">
            <p class="truncate font-semibold text-espuma">{{ pico.nome }}</p>
            <span class="shrink-0 text-xs text-oceano-400">{{ rotuloDoScore(pico.condicao_momento?.score) }}</span>
          </div>

          <p v-if="pico.erro_previsao" class="mt-1 text-xs text-perigo">{{ pico.erro_previsao }}</p>

          <dl v-else-if="pico.condicao_momento" class="numeros mt-1.5 grid grid-cols-3 gap-x-3 gap-y-1 whitespace-nowrap text-[13px]">
            <div class="flex items-center gap-1.5" title="Ondulação: altura · período · direção">
              <dt class="sr-only">Ondulação</dt>
              <span class="text-acento">≋</span>
              <dd class="text-espuma">{{ formatarNumero(pico.condicao_momento.swell_altura, 1, 'm') }}</dd>
            </div>
            <div class="flex items-center gap-1.5" title="Período da ondulação">
              <dt class="sr-only">Período</dt>
              <span class="text-oceano-400">◷</span>
              <dd class="text-espuma">{{ formatarNumero(pico.condicao_momento.swell_periodo, 0, 's') }}</dd>
            </div>
            <div class="flex items-center gap-1.5" title="Direção da ondulação (de onde vem)">
              <dt class="sr-only">Direção da ondulação</dt>
              <SetaDirecao :graus="pico.condicao_momento.swell_direcao" :tamanho="13" class="text-acento" />
              <dd class="text-espuma">{{ direcaoCardinal(pico.condicao_momento.swell_direcao) }}</dd>
            </div>
            <div class="flex items-center gap-1.5" title="Vento (nós) e direção de onde vem">
              <dt class="sr-only">Vento</dt>
              <SetaDirecao :graus="pico.condicao_momento.vento_direcao" :tamanho="13" class="text-oceano-300" />
              <dd class="text-espuma">{{ formatarNumero(pico.condicao_momento.vento_velocidade, 0, 'kn') }} {{ direcaoCardinal(pico.condicao_momento.vento_direcao) }}</dd>
            </div>
            <div class="flex items-center gap-1.5" title="Maré (nível do mar)">
              <dt class="sr-only">Maré</dt>
              <span class="text-oceano-400">↕</span>
              <dd class="text-espuma">{{ formatarNumero(pico.condicao_momento.mare, 2, 'm') }}</dd>
            </div>
            <div class="flex items-center gap-1.5" title="Temperatura da água">
              <dt class="sr-only">Água</dt>
              <span class="text-oceano-400">°</span>
              <dd class="text-espuma">{{ formatarNumero(pico.condicao_momento.temperatura_agua, 0, '°C') }}</dd>
            </div>
          </dl>
        </div>

        <TendenciaScore v-if="pico.tendencia" :tendencia="pico.tendencia" class="hidden shrink-0 sm:flex" />

        <div class="flex shrink-0 gap-1 opacity-60 transition group-hover:opacity-100">
          <button class="botao-icone" type="button" title="Editar pico" aria-label="Editar pico" @click.stop="emit('editar', pico)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
          </button>
          <button class="botao-icone hover:!text-perigo" type="button" title="Remover pico" aria-label="Remover pico" @click.stop="emit('remover', pico)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></svg>
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
