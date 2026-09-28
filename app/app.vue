<script setup>
/*
  Tela principal: mapa à esquerda; resumo do melhor pico e lista (ou
  formulário) à direita; detalhe do pico em um painel sobreposto.
*/
const api = useApi();

// intervalo de atualização automática (a API guarda os dados por 1 hora)
const ATUALIZACAO_MINUTOS = 15;

const picos = ref([]);
const carregandoPicos = ref(false);
const atualizadoEm = ref(null);
// momento padrão em que a lista "Meus picos" é exibida (ex.: "Amanhã às 6h")
const rotuloMomentoLista = ref('');

const ranking = ref(null);
const momento = ref(null);
const carregandoRanking = ref(false);

const picoSelecionadoId = ref(null);
const detalheAberto = ref(false);
const detalhe = ref(null);
const carregandoDetalhe = ref(false);
const erroDetalhe = ref(null);

const modoFormulario = ref(null);
const picoEmEdicao = ref(null);
const posicaoFormulario = ref(null);
const salvando = ref(false);
const erroFormulario = ref(null);

const aviso = ref(null);
const mapa = ref(null);
let temporizadorAviso = null;

/*
  Mostra um aviso temporário (sucesso ou erro)
*/
const mostrarAviso = (texto, erro = false) => {
  aviso.value = { texto, erro };
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { aviso.value = null; }, 4500);
};

/*
  GET /picos: carrega a lista de picos com a condição atual
*/
const carregarPicos = async () => {
  carregandoPicos.value = true;
  try {
    const dados = await api.listarPicos();
    picos.value = dados.picos;
    rotuloMomentoLista.value = dados.rotulo_momento;
    atualizadoEm.value = new Date();
  } catch (error) {
    console.error('Error:', error);
    mostrarAviso(error.message, true);
  } finally {
    carregandoPicos.value = false;
  }
};

/*
  GET /ranking: carrega o melhor pico para o momento escolhido
*/
const carregarRanking = async () => {
  carregandoRanking.value = true;
  try {
    let dados = await api.buscarRanking(momento.value);
    // o momento escolhido saiu da lista (o horário passou): volta ao padrão
    if (momento.value && !dados.opcoes.some((opcao) => opcao.id === momento.value)) {
      momento.value = null;
      dados = await api.buscarRanking();
    }
    ranking.value = dados;
  } catch (error) {
    console.error('Error:', error);
    mostrarAviso(error.message, true);
  } finally {
    carregandoRanking.value = false;
  }
};

const recarregarTudo = async () => {
  await carregarPicos();
  await carregarRanking();
};

const trocarMomento = (novoMomento) => {
  momento.value = novoMomento;
  carregarRanking();
};

/*
  GET /pico: abre o formato estendido de um pico
*/
const abrirDetalhe = async (id) => {
  picoSelecionadoId.value = id;
  detalheAberto.value = true;
  detalhe.value = null;
  erroDetalhe.value = null;
  carregandoDetalhe.value = true;

  const pico = picos.value.find((p) => p.id === id);
  if (pico) mapa.value?.centralizar(pico.latitude, pico.longitude);

  try {
    detalhe.value = await api.buscarPico(id);
  } catch (error) {
    console.error('Error:', error);
    erroDetalhe.value = error.message;
  } finally {
    carregandoDetalhe.value = false;
  }
};

const fecharDetalhe = () => {
  detalheAberto.value = false;
};

/*
  Abre o formulário de novo pico (a posição vem do clique no mapa)
*/
const novoPico = () => {
  detalheAberto.value = false;
  picoEmEdicao.value = null;
  posicaoFormulario.value = null;
  erroFormulario.value = null;
  modoFormulario.value = 'novo';
};

/*
  Abre o formulário de edição com os dados atuais do pico
*/
const editarPico = (pico) => {
  detalheAberto.value = false;
  picoEmEdicao.value = pico;
  picoSelecionadoId.value = pico.id;
  posicaoFormulario.value = { latitude: pico.latitude, longitude: pico.longitude };
  erroFormulario.value = null;
  modoFormulario.value = 'editar';
};

const cancelarFormulario = () => {
  modoFormulario.value = null;
  picoEmEdicao.value = null;
  posicaoFormulario.value = null;
};

/*
  POST /pico ou PUT /pico, conforme o modo do formulário
*/
const salvarPico = async (dados) => {
  salvando.value = true;
  erroFormulario.value = null;
  try {
    if (modoFormulario.value === 'editar') {
      await api.atualizarPico(picoEmEdicao.value.id, dados);
      mostrarAviso('Pico atualizado!');
    } else {
      const novo = await api.adicionarPico(dados);
      picoSelecionadoId.value = novo.id;
      mostrarAviso('Pico adicionado!');
    }
    cancelarFormulario();
    await recarregarTudo();
  } catch (error) {
    console.error('Error:', error);
    erroFormulario.value = error.message;
  } finally {
    salvando.value = false;
  }
};

/*
  DELETE /pico: remove um pico após confirmação
*/
const removerPico = async (pico) => {
  if (!confirm(`Remover o pico "${pico.nome}"?`)) return;
  try {
    await api.removerPico(pico.id);
    if (picoSelecionadoId.value === pico.id) {
      picoSelecionadoId.value = null;
      detalheAberto.value = false;
    }
    mostrarAviso('Pico removido!');
    await recarregarTudo();
  } catch (error) {
    console.error('Error:', error);
    mostrarAviso(error.message, true);
  }
};

let temporizadorAtualizacao = null;

onMounted(() => {
  recarregarTudo();
  temporizadorAtualizacao = setInterval(recarregarTudo, ATUALIZACAO_MINUTOS * 60 * 1000);
});

onBeforeUnmount(() => {
  clearInterval(temporizadorAtualizacao);
  clearTimeout(temporizadorAviso);
});
</script>

<template>
  <div class="flex min-h-full flex-col lg:h-full">
    <!-- cabeçalho -->
    <header class="flex flex-wrap items-center gap-4 border-b border-oceano-800 px-4 py-3 sm:px-6">
      <div class="flex items-center gap-3">
        <img src="/favicon.svg" alt="" class="h-9 w-9">
        <div>
          <h1 class="text-lg font-bold leading-tight text-espuma">Minhas Ondas</h1>
          <p class="text-xs text-oceano-400">Condições de surf dos seus picos</p>
        </div>
      </div>

      <div class="ml-auto flex items-center gap-3">
        <span v-if="atualizadoEm" class="numeros hidden text-xs text-oceano-400 sm:inline">
          Atualizado às {{ atualizadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}
        </span>
        <button type="button" class="botao-secundario" :disabled="carregandoPicos" @click="recarregarTudo">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" :class="{ 'animate-spin': carregandoPicos }"><path d="M21 12a9 9 0 1 1-2.6-6.4L21 8" /><path d="M21 3v5h-5" /></svg>
          Atualizar
        </button>
        <button type="button" class="botao-primario" :disabled="modoFormulario === 'novo'" @click="novoPico">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Novo pico
        </button>
      </div>
    </header>

    <!-- conteúdo: mapa + painel lateral -->
    <main class="grid flex-1 gap-4 p-4 lg:min-h-0 lg:grid-cols-12 sm:p-6">
      <div class="h-[55vh] lg:col-span-7 lg:h-auto lg:min-h-0 xl:col-span-8">
        <MapaPicos
          ref="mapa"
          :picos="picos"
          :selecionado-id="picoSelecionadoId"
          :modo-selecao="modoFormulario !== null"
          :posicao-escolhida="posicaoFormulario"
          @selecionar="abrirDetalhe"
          @escolher-posicao="posicaoFormulario = $event"
        />
      </div>

      <aside class="flex flex-col gap-4 lg:col-span-5 lg:min-h-0 xl:col-span-4">
        <ResumoMelhor
          v-if="!modoFormulario"
          :ranking="ranking"
          :carregando="carregandoRanking"
          @trocar-momento="trocarMomento"
          @selecionar="abrirDetalhe"
        />

        <FormularioPico
          v-if="modoFormulario"
          :key="picoEmEdicao?.id ?? 'novo'"
          v-model:posicao="posicaoFormulario"
          :pico="picoEmEdicao"
          :salvando="salvando"
          :erro="erroFormulario"
          @salvar="salvarPico"
          @cancelar="cancelarFormulario"
        />

        <ListaPicos
          v-else
          :picos="picos"
          :rotulo-momento="rotuloMomentoLista"
          :selecionado-id="picoSelecionadoId"
          :carregando="carregandoPicos"
          @selecionar="abrirDetalhe"
          @editar="editarPico"
          @remover="removerPico"
        />
      </aside>
    </main>

    <DetalhePico
      v-if="detalheAberto"
      :detalhe="detalhe"
      :carregando="carregandoDetalhe"
      :erro="erroDetalhe"
      @fechar="fecharDetalhe"
      @editar="editarPico"
      @remover="removerPico"
    />

    <!-- aviso temporário -->
    <Transition
      enter-from-class="translate-y-4 opacity-0"
      leave-to-class="translate-y-4 opacity-0"
      enter-active-class="transition duration-200"
      leave-active-class="transition duration-200"
    >
      <div
        v-if="aviso"
        class="fixed bottom-6 right-6 z-[1100] max-w-sm rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl"
        :class="aviso.erro ? 'bg-perigo text-espuma' : 'bg-espuma text-oceano-950'"
        role="status"
      >
        {{ aviso.texto }}
      </div>
    </Transition>
  </div>
</template>
