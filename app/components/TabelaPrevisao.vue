<script setup>
/*
  Tabela com todos os dados coletados da API externa. As horas seguem em
  colunas (leitura temporal da esquerda para a direita) e todos os dias ficam
  em um único scroll horizontal; os botões de dia funcionam como âncoras.
*/
const props = defineProps({
  horas: { type: Array, required: true },
  horaAtual: { type: String, default: null },
});

// horários de interesse para surfar, destacados no cabeçalho
const HORARIOS_INTERESSE = ['06', '10', '14', '18'];

// largura da coluna fixa com os nomes das linhas (px) — usada no scroll das âncoras
const LARGURA_ROTULOS = 168;

/*
  Linhas da tabela: grupos com um título e as variáveis de cada grupo
*/
const GRUPOS = [
  {
    titulo: 'Ondulação (swell)',
    linhas: [
      { rotulo: 'Altura (m)', campo: 'swell_altura', casas: 2 },
      { rotulo: 'Período (s)', campo: 'swell_periodo', casas: 1 },
      { rotulo: 'Direção', campo: 'swell_direcao', direcao: true, classe: 'text-acento' },
    ],
  },
  {
    titulo: 'Onda total',
    linhas: [
      { rotulo: 'Altura (m)', campo: 'onda_altura', casas: 2 },
      { rotulo: 'Período (s)', campo: 'onda_periodo', casas: 1 },
      { rotulo: 'Direção', campo: 'onda_direcao', direcao: true, classe: 'text-oceano-300' },
    ],
  },
  {
    titulo: 'Vento',
    linhas: [
      { rotulo: 'Média (kn)', campo: 'vento_velocidade', casas: 0 },
      { rotulo: 'Rajada (kn)', campo: 'vento_rajada', casas: 0 },
      { rotulo: 'Direção', campo: 'vento_direcao', direcao: true, classe: 'text-oceano-300' },
    ],
  },
  {
    titulo: 'Mar',
    linhas: [
      { rotulo: 'Maré (m)', campo: 'mare', casas: 2 },
      { rotulo: 'Água (°C)', campo: 'temperatura_agua', casas: 1 },
    ],
  },
];

const rolagem = ref(null);
const diaVisivel = ref(null);

// dias presentes nos dados, com a quantidade de horas de cada um
const dias = computed(() => {
  const lista = [];
  props.horas.forEach((hora) => {
    const dia = hora.hora.slice(0, 10);
    const ultimo = lista[lista.length - 1];
    if (ultimo?.dia === dia) ultimo.total += 1;
    else lista.push({ dia, total: 1 });
  });
  return lista;
});

const inicioDoDia = (hora) => hora.hora.endsWith('T00:00');
const horarioInteresse = (hora) => HORARIOS_INTERESSE.includes(hora.hora.slice(11, 13));
const ehAgora = (hora) => hora.hora === props.horaAtual;

/*
  Classes comuns das células de uma coluna (separador de dia e hora atual)
*/
const classesColuna = (hora) => ({
  'border-l border-oceano-600': inicioDoDia(hora),
  'bg-acento/10': ehAgora(hora),
});

/*
  Rola até a primeira coluna de um dia (âncora dos botões)
*/
const irParaDia = (dia) => {
  const coluna = rolagem.value?.querySelector(`[data-hora^="${dia}"]`);
  if (!coluna) return;
  rolagem.value.scrollTo({ left: coluna.offsetLeft - LARGURA_ROTULOS, behavior: 'smooth' });
};

/*
  Rola até a hora atual, deixando algumas horas anteriores visíveis
*/
const irParaAgora = () => {
  const coluna = props.horaAtual && rolagem.value?.querySelector(`[data-hora="${props.horaAtual}"]`);
  if (!coluna) return;
  rolagem.value.scrollTo({ left: coluna.offsetLeft - LARGURA_ROTULOS - coluna.offsetWidth * 2 });
};

/*
  Atualiza o dia destacado nos botões conforme o scroll horizontal
*/
const atualizarDiaVisivel = () => {
  if (!rolagem.value) return;
  const referencia = rolagem.value.scrollLeft + LARGURA_ROTULOS + 1;
  let atual = dias.value[0]?.dia;
  rolagem.value.querySelectorAll('[data-inicio-dia]').forEach((celula) => {
    if (celula.offsetLeft <= referencia) atual = celula.dataset.inicioDia;
  });
  diaVisivel.value = atual;
};

onMounted(async () => {
  await nextTick();
  irParaAgora();
  atualizarDiaVisivel();
});
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-1.5" aria-label="Ir para o dia">
      <button
        v-for="{ dia } in dias"
        :key="dia"
        type="button"
        class="numeros rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="dia === diaVisivel ? 'bg-espuma text-oceano-950' : 'bg-oceano-800 text-oceano-300 hover:text-espuma'"
        :aria-current="dia === diaVisivel ? 'true' : undefined"
        @click="irParaDia(dia)"
      >
        {{ diaRelativo(`${dia}T00:00`) }}
      </button>
      <button
        v-if="horaAtual"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold text-acento transition hover:bg-oceano-800"
        @click="irParaAgora"
      >
        Agora
      </button>
    </div>

    <div
      ref="rolagem"
      class="relative mt-3 overflow-x-auto rounded-xl border border-oceano-700/70"
      @scroll.passive="atualizarDiaVisivel"
    >
      <table class="numeros border-separate border-spacing-0 whitespace-nowrap text-center text-[13px]">
        <thead>
          <!-- dias -->
          <tr class="bg-oceano-850">
            <th
              class="sticky left-0 z-20 border-b border-r border-oceano-700 bg-oceano-850 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-oceano-400"
              :style="{ width: `${LARGURA_ROTULOS}px`, minWidth: `${LARGURA_ROTULOS}px` }"
            >
              Dia
            </th>
            <th
              v-for="{ dia, total } in dias"
              :key="dia"
              :colspan="total"
              :data-inicio-dia="dia"
              class="border-b border-l border-oceano-600 px-0 py-2 text-left text-xs font-semibold text-espuma"
            >
              <span class="sticky px-3" :style="{ left: `${LARGURA_ROTULOS}px` }">{{ formatarDia(`${dia}T00:00`) }}</span>
            </th>
          </tr>

          <!-- horas -->
          <tr class="bg-oceano-850 text-[11px] text-oceano-400">
            <th class="sticky left-0 z-20 border-b border-r border-oceano-700 bg-oceano-850 px-3 py-1.5 text-left font-semibold uppercase tracking-wider">
              Hora
            </th>
            <th
              v-for="hora in horas"
              :key="hora.hora"
              :data-hora="hora.hora"
              class="min-w-[52px] border-b border-oceano-700 px-1.5 py-1.5 font-semibold"
              :class="[classesColuna(hora), horarioInteresse(hora) ? 'text-espuma' : '']"
            >
              <span v-if="ehAgora(hora)" class="block text-[9px] font-bold uppercase text-acento">agora</span>
              {{ formatarHora(hora.hora) }}
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- score -->
          <tr>
            <th class="sticky left-0 z-10 border-b border-r border-oceano-700 bg-oceano-900 px-3 py-2 text-left text-sm font-semibold text-espuma">
              Score
            </th>
            <td
              v-for="hora in horas"
              :key="hora.hora"
              class="border-b border-oceano-800 px-1 py-1.5"
              :class="classesColuna(hora)"
            >
              <span
                class="mx-auto flex h-6 w-10 items-center justify-center rounded-md text-xs font-bold text-oceano-950"
                :style="{ backgroundColor: corDoScore(hora.score) }"
              >
                {{ formatarScore(hora.score) }}
              </span>
            </td>
          </tr>

          <template v-for="grupo in GRUPOS" :key="grupo.titulo">
            <tr>
              <th class="sticky left-0 z-10 border-r border-oceano-700 bg-oceano-900 px-3 pb-1 pt-3 text-left text-[11px] font-semibold uppercase tracking-wider text-oceano-400">
                {{ grupo.titulo }}
              </th>
              <td v-for="hora in horas" :key="hora.hora" class="pt-3" :class="classesColuna(hora)" />
            </tr>
            <tr v-for="linha in grupo.linhas" :key="linha.campo" class="text-espuma">
              <th class="sticky left-0 z-10 border-r border-oceano-700 bg-oceano-900 px-3 py-1 text-left text-[13px] font-medium text-oceano-200">
                {{ linha.rotulo }}
              </th>
              <td
                v-for="hora in horas"
                :key="hora.hora"
                class="px-1.5 py-1"
                :class="classesColuna(hora)"
              >
                <span v-if="linha.direcao" class="inline-flex flex-col items-center leading-tight">
                  <SetaDirecao :graus="hora[linha.campo]" :tamanho="12" :class="linha.classe" />
                  <span class="text-[11px]">{{ direcaoCardinal(hora[linha.campo]) }}</span>
                </span>
                <template v-else>{{ formatarNumero(hora[linha.campo], linha.casas) }}</template>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
