<script setup>
/*
  Formato estendido de um pico: condição atual, notas do score, gráficos de
  maré e de evolução do score e a tabela com todos os dados coletados
*/
const props = defineProps({
  detalhe: { type: Object, default: null },
  carregando: { type: Boolean, default: false },
  erro: { type: String, default: null },
});

const emit = defineEmits(['fechar', 'editar', 'remover']);

const FATORES = [
  { chave: 'tamanho', rotulo: 'Tamanho' },
  { chave: 'periodo', rotulo: 'Período' },
  { chave: 'direcao', rotulo: 'Direção' },
  { chave: 'vento', rotulo: 'Vento' },
];

const atual = computed(() => props.detalhe?.condicao_atual ?? null);
const indiceAgora = computed(() => (atual.value
  ? props.detalhe.horas.findIndex((h) => h.hora === atual.value.hora)
  : null));

const metricas = computed(() => {
  const c = atual.value;
  if (!c) return [];
  return [
    { rotulo: 'Ondulação', valor: formatarNumero(c.swell_altura, 1, 'm'), extra: `${formatarNumero(c.swell_periodo, 0, 's')} · ${direcaoCardinal(c.swell_direcao)}`, seta: c.swell_direcao },
    { rotulo: 'Onda total', valor: formatarNumero(c.onda_altura, 1, 'm'), extra: `${formatarNumero(c.onda_periodo, 0, 's')} · ${direcaoCardinal(c.onda_direcao)}`, seta: c.onda_direcao },
    { rotulo: 'Vento', valor: formatarNumero(c.vento_velocidade, 0, 'kn'), extra: `rajada ${formatarNumero(c.vento_rajada, 0, 'kn')} · ${direcaoCardinal(c.vento_direcao)}`, seta: c.vento_direcao },
    { rotulo: 'Maré', valor: formatarNumero(c.mare, 2, 'm'), extra: 'nível do mar' },
    { rotulo: 'Água', valor: formatarNumero(c.temperatura_agua, 1, '°C'), extra: 'superfície' },
  ];
});

const fecharComEsc = (evento) => {
  if (evento.key === 'Escape') emit('fechar');
};

onMounted(() => window.addEventListener('keydown', fecharComEsc));
onBeforeUnmount(() => window.removeEventListener('keydown', fecharComEsc));
</script>

<template>
  <div class="fixed inset-0 z-[1000] flex justify-center overflow-y-auto bg-oceano-950/80 p-4 backdrop-blur-sm sm:p-8" @click.self="emit('fechar')">
    <article class="painel h-fit w-full max-w-6xl" role="dialog" aria-modal="true" :aria-label="detalhe?.nome ?? 'Detalhe do pico'">
      <header class="flex items-start gap-5 border-b border-oceano-700/70 p-6">
        <BadgeScore :score="atual?.score ?? null" tamanho="lg" />
        <div class="min-w-0 flex-1">
          <p class="rotulo">Pico</p>
          <h2 class="truncate text-2xl font-bold text-espuma">{{ detalhe?.nome ?? 'Carregando…' }}</h2>
          <p v-if="detalhe" class="numeros mt-1 text-sm text-oceano-300">
            {{ rotuloDoScore(atual?.score) }} agora ·
            {{ formatarNumero(detalhe.latitude, 4) }}, {{ formatarNumero(detalhe.longitude, 4) }} ·
            dados coletados às {{ detalhe.coletado_em?.slice(11, 16) }} (renova às {{ detalhe.expira_em?.slice(11, 16) }})
          </p>
        </div>
        <div class="flex shrink-0 gap-2">
          <button v-if="detalhe" type="button" class="botao-secundario" @click="emit('editar', detalhe)">Editar</button>
          <button v-if="detalhe" type="button" class="botao-secundario hover:!border-perigo hover:!text-perigo" @click="emit('remover', detalhe)">Remover</button>
          <button type="button" class="botao-icone" aria-label="Fechar" title="Fechar (Esc)" @click="emit('fechar')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
      </header>

      <div v-if="erro" class="p-8 text-center text-perigo">{{ erro }}</div>
      <div v-else-if="carregando && !detalhe" class="p-12 text-center text-oceano-400">Carregando dados do pico…</div>

      <div v-else-if="detalhe" class="space-y-6 p-6">
        <!-- condição atual e notas do score -->
        <div class="grid gap-4 lg:grid-cols-12">
          <dl class="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:col-span-8">
            <div v-for="metrica in metricas" :key="metrica.rotulo" class="rounded-xl bg-oceano-850 p-4">
              <dt class="rotulo">{{ metrica.rotulo }}</dt>
              <dd class="numeros mt-1 flex items-center gap-2 text-2xl font-bold text-espuma">
                {{ metrica.valor }}
                <SetaDirecao v-if="metrica.seta !== undefined" :graus="metrica.seta" :tamanho="16" class="text-acento" />
              </dd>
              <dd class="numeros mt-0.5 text-xs text-oceano-300">{{ metrica.extra }}</dd>
            </div>
          </dl>

          <div class="rounded-xl bg-oceano-850 p-4 lg:col-span-4">
            <p class="rotulo">Notas do score agora</p>
            <ul class="mt-3 space-y-2.5">
              <li v-for="fator in FATORES" :key="fator.chave" class="flex items-center gap-3 text-sm">
                <span class="w-16 text-oceano-300">{{ fator.rotulo }}</span>
                <span class="h-2 flex-1 overflow-hidden rounded-full bg-oceano-700">
                  <span class="block h-full rounded-full" :style="{ width: `${(atual?.fatores?.[fator.chave] ?? 0) * 10}%`, backgroundColor: corDoScore(atual?.fatores?.[fator.chave]) }" />
                </span>
                <span class="numeros w-8 text-right font-semibold text-espuma">{{ formatarScore(atual?.fatores?.[fator.chave]) }}</span>
              </li>
            </ul>
            <p class="numeros mt-4 border-t border-oceano-700 pt-3 text-xs text-oceano-400">
              Preferências: ondulação {{ formatarNumero(detalhe.swell_altura_ideal, 1, 'm') }} ·
              {{ formatarNumero(detalhe.swell_periodo_ideal, 0, 's') }} ·
              {{ direcaoCardinal(detalhe.swell_direcao_ideal) }} — vento {{ direcaoCardinal(detalhe.vento_direcao_ideal) }}
            </p>
          </div>
        </div>

        <!-- gráficos -->
        <div class="grid gap-4 lg:grid-cols-2">
          <section class="rounded-xl bg-oceano-850 p-4">
            <h3 class="mb-3 text-sm font-semibold text-espuma">Evolução do score</h3>
            <GraficoScore :horas="detalhe.horas" :indice-agora="indiceAgora" />
          </section>
          <section class="rounded-xl bg-oceano-850 p-4">
            <h3 class="mb-3 text-sm font-semibold text-espuma">Tábua de maré</h3>
            <GraficoMare :horas="detalhe.horas" :indice-agora="indiceAgora" />
          </section>
        </div>

        <!-- tabela completa -->
        <section>
          <div class="mb-3 flex items-baseline justify-between gap-3">
            <h3 class="text-sm font-semibold text-espuma">Dados coletados</h3>
            <a href="https://open-meteo.com/" target="_blank" rel="noopener" class="text-xs text-oceano-400 hover:text-espuma">
              Dados de clima e mar: Open-Meteo.com (CC BY 4.0)
            </a>
          </div>
          <TabelaPrevisao :horas="detalhe.horas" :hora-atual="atual?.hora ?? null" />
        </section>
      </div>
    </article>
  </div>
</template>
