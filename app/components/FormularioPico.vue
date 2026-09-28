<script setup>
/*
  Formulário de novo pico / edição de pico. A posição é escolhida clicando no
  mapa (ou digitada); as direções usam o seletor giratório.
*/
const props = defineProps({
  pico: { type: Object, default: null },
  salvando: { type: Boolean, default: false },
  erro: { type: String, default: null },
});

const posicao = defineModel('posicao', { type: Object, default: null });

const emit = defineEmits(['salvar', 'cancelar']);

const editando = computed(() => Boolean(props.pico));

const formulario = reactive({
  nome: props.pico?.nome ?? '',
  swell_direcao_ideal: props.pico?.swell_direcao_ideal ?? 180,
  swell_altura_ideal: props.pico?.swell_altura_ideal ?? 1.5,
  swell_periodo_ideal: props.pico?.swell_periodo_ideal ?? 11,
  vento_direcao_ideal: props.pico?.vento_direcao_ideal ?? 0,
});

const mensagemValidacao = ref('');

const latitude = computed({
  get: () => posicao.value?.latitude ?? '',
  set: (valor) => { posicao.value = { ...posicao.value, latitude: valor === '' ? null : Number(valor) }; },
});

const longitude = computed({
  get: () => posicao.value?.longitude ?? '',
  set: (valor) => { posicao.value = { ...posicao.value, longitude: valor === '' ? null : Number(valor) }; },
});

/*
  Valida a entrada antes de enviar à API
*/
const validar = () => {
  if (formulario.nome.trim().length < 2) return 'Escreva o nome do pico (mínimo 2 letras).';
  const lat = posicao.value?.latitude;
  const lon = posicao.value?.longitude;
  if (lat === null || lat === undefined || lon === null || lon === undefined) {
    return 'Clique no mapa para marcar a posição do pico.';
  }
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return 'Latitude ou longitude inválida.';
  return '';
};

const enviar = () => {
  mensagemValidacao.value = validar();
  if (mensagemValidacao.value) return;
  emit('salvar', {
    ...formulario,
    nome: formulario.nome.trim(),
    latitude: posicao.value.latitude,
    longitude: posicao.value.longitude,
  });
};
</script>

<template>
  <section class="painel flex min-h-0 flex-1 flex-col">
    <header class="flex items-center justify-between border-b border-oceano-700/70 px-5 py-3">
      <h2 class="text-sm font-semibold text-espuma">{{ editando ? 'Editar pico' : 'Novo pico' }}</h2>
      <button type="button" class="botao-icone" aria-label="Cancelar" title="Cancelar" @click="emit('cancelar')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </header>

    <form class="min-h-0 flex-1 space-y-5 overflow-y-auto p-5" novalidate @submit.prevent="enviar">
      <div>
        <label for="nomePico" class="rotulo">Título</label>
        <input id="nomePico" v-model="formulario.nome" class="campo mt-1.5" type="text" maxlength="140" placeholder="Ex.: Barra da Tijuca Posto 8" autocomplete="off">
      </div>

      <fieldset>
        <legend class="rotulo">Posição</legend>
        <p class="mt-1 text-xs text-oceano-400">Clique no mar, perto da arrebentação. Pontos em terra são recusados.</p>
        <div class="mt-2 grid grid-cols-2 gap-3">
          <label class="text-xs text-oceano-300">
            Latitude
            <input v-model="latitude" class="campo numeros mt-1" type="number" step="0.00001" placeholder="—">
          </label>
          <label class="text-xs text-oceano-300">
            Longitude
            <input v-model="longitude" class="campo numeros mt-1" type="number" step="0.00001" placeholder="—">
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend class="rotulo">Condições preferidas</legend>
        <p class="mt-1 text-xs text-oceano-400">Direções indicam de onde a ondulação e o vento vêm.</p>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <SeletorDirecao v-model="formulario.swell_direcao_ideal" rotulo="Ondulação" cor="#5cc8ff" />
          <SeletorDirecao v-model="formulario.vento_direcao_ideal" rotulo="Vento" cor="#ffffff" />
        </div>
      </fieldset>

      <div>
        <div class="flex items-baseline justify-between">
          <label for="alturaPico" class="rotulo">Tamanho da ondulação</label>
          <span class="numeros text-lg font-bold text-espuma">{{ formatarNumero(formulario.swell_altura_ideal, 1, 'm') }}</span>
        </div>
        <input id="alturaPico" v-model.number="formulario.swell_altura_ideal" class="mt-2 w-full accent-acento" type="range" min="0.3" max="4" step="0.1">
      </div>

      <div>
        <div class="flex items-baseline justify-between">
          <label for="periodoPico" class="rotulo">Período da ondulação</label>
          <span class="numeros text-lg font-bold text-espuma">{{ formatarNumero(formulario.swell_periodo_ideal, 0, 's') }}</span>
        </div>
        <input id="periodoPico" v-model.number="formulario.swell_periodo_ideal" class="mt-2 w-full accent-acento" type="range" min="5" max="20" step="1">
      </div>

      <p v-if="mensagemValidacao || erro" class="rounded-lg border border-perigo/40 bg-perigo/10 px-3 py-2 text-sm text-perigo" role="alert">
        {{ mensagemValidacao || erro }}
      </p>

      <div class="flex gap-3 pt-1">
        <button type="submit" class="botao-primario flex-1" :disabled="salvando">
          {{ salvando ? 'Consultando o mar…' : (editando ? 'Salvar alterações' : 'Adicionar pico') }}
        </button>
        <button type="button" class="botao-secundario" @click="emit('cancelar')">Cancelar</button>
      </div>
    </form>
  </section>
</template>
