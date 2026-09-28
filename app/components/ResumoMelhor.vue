<script setup>
/*
  Resumo com o melhor pico para ir no momento escolhido. Sem escolha do
  usuário, a API usa "hoje" até as 14h e "amanhã" depois disso.
*/
const props = defineProps({
  ranking: { type: Object, default: null },
  carregando: { type: Boolean, default: false },
});

const emit = defineEmits(['trocarMomento', 'selecionar']);

const melhor = computed(() => {
  const primeiro = props.ranking?.ranking?.[0];
  return primeiro && primeiro.score !== null ? primeiro : null;
});

const seguintes = computed(() => (props.ranking?.ranking ?? [])
  .slice(1, 4)
  .filter((item) => item.score !== null));
</script>

<template>
  <section class="painel p-5">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-sm font-semibold text-espuma">Melhor pico para ir</h2>
      <label class="sr-only" for="seletorMomento">Momento</label>
      <select
        id="seletorMomento"
        class="rounded-lg border border-oceano-600 bg-oceano-950 px-3 py-1.5 text-sm font-medium text-espuma focus:border-acento focus:outline-none"
        :value="ranking?.momento"
        :disabled="!ranking"
        @change="emit('trocarMomento', $event.target.value)"
      >
        <option v-for="opcao in ranking?.opcoes ?? []" :key="opcao.id" :value="opcao.id">
          {{ opcao.rotulo }}
        </option>
      </select>
    </div>

    <div v-if="carregando && !ranking" class="py-6 text-sm text-oceano-400">Calculando…</div>

    <div v-else-if="!melhor" class="py-6 text-sm text-oceano-400">
      Sem picos com dados para este momento.
    </div>

    <div v-else class="mt-4 flex items-center gap-5" :class="{ 'opacity-60': carregando }">
      <button type="button" class="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-acento" @click="emit('selecionar', melhor.pico_id)">
        <BadgeScore :score="melhor.score" tamanho="lg" />
      </button>

      <div class="min-w-0 flex-1">
        <button type="button" class="block max-w-full truncate text-left text-xl font-bold text-espuma hover:underline" @click="emit('selecionar', melhor.pico_id)">
          {{ melhor.nome }}
        </button>
        <p class="mt-0.5 text-sm text-oceano-300">
          {{ rotuloDoScore(melhor.score) }} ·
          <span class="numeros font-semibold text-espuma">{{ diaRelativo(melhor.condicao.hora) }} às {{ formatarHora(melhor.condicao.hora) }}</span>
        </p>
        <p class="numeros mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-espuma">
          <span class="flex items-center gap-1">
            <span class="text-acento">≋</span>
            {{ formatarNumero(melhor.condicao.swell_altura, 1, 'm') }} · {{ formatarNumero(melhor.condicao.swell_periodo, 0, 's') }}
            <SetaDirecao :graus="melhor.condicao.swell_direcao" :tamanho="12" class="text-acento" />
            {{ direcaoCardinal(melhor.condicao.swell_direcao) }}
          </span>
          <span class="flex items-center gap-1">
            <SetaDirecao :graus="melhor.condicao.vento_direcao" :tamanho="12" class="text-oceano-300" />
            {{ formatarNumero(melhor.condicao.vento_velocidade, 0, 'kn') }} {{ direcaoCardinal(melhor.condicao.vento_direcao) }}
          </span>
        </p>
      </div>
    </div>

    <ol v-if="seguintes.length" class="mt-4 space-y-1 border-t border-oceano-700/70 pt-3">
      <li v-for="(item, indice) in seguintes" :key="item.pico_id">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-oceano-800"
          @click="emit('selecionar', item.pico_id)"
        >
          <span class="numeros w-4 text-oceano-400">{{ indice + 2 }}</span>
          <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: corDoScore(item.score) }" />
          <span class="flex-1 truncate text-espuma">{{ item.nome }}</span>
          <span class="numeros text-oceano-300">{{ formatarHora(item.condicao.hora) }}</span>
          <span class="numeros w-8 text-right font-semibold text-espuma">{{ formatarScore(item.score) }}</span>
        </button>
      </li>
    </ol>
  </section>
</template>
