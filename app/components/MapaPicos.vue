<script setup>
/*
  Mapa (Leaflet + tiles gratuitos do OpenStreetMap) com um pin circular
  por pico, colorido pelo score da hora atual. No modo de seleção, um clique no
  mapa escolhe a posição de um novo pico (ou a nova posição de um pico editado).
*/
const props = defineProps({
  picos: { type: Array, default: () => [] },
  selecionadoId: { type: Number, default: null },
  modoSelecao: { type: Boolean, default: false },
  posicaoEscolhida: { type: Object, default: null },
});

const emit = defineEmits(['selecionar', 'escolherPosicao']);

const CENTRO_INICIAL = [-22.99, -43.35];
const ZOOM_INICIAL = 11;

const elementoMapa = ref(null);
let L = null;
let mapa = null;
let camadaPicos = null;
let marcadorNovo = null;
let enquadrado = false;
let observadorTamanho = null;

/*
  Desenha (ou redesenha) os pins dos picos
*/
const desenharPicos = () => {
  if (!mapa) return;
  camadaPicos.clearLayers();

  props.picos.forEach((pico) => {
    const score = pico.condicao_atual?.score ?? null;
    const selecionado = pico.id === props.selecionadoId;
    const tamanho = selecionado ? 38 : 32;
    const icone = L.divIcon({
      className: '',
      iconSize: [tamanho, tamanho],
      iconAnchor: [tamanho / 2, tamanho / 2],
      html: `<div class="pin-pico${selecionado ? ' selecionado' : ''}" style="background:${corDoScore(score)}">${score === null ? '?' : formatarScore(score)}</div>`,
    });

    L.marker([pico.latitude, pico.longitude], {
      icon: icone,
      zIndexOffset: selecionado ? 1000 : 0,
      keyboard: true,
      title: pico.nome,
    })
      .bindTooltip(`${pico.nome} · ${rotuloDoScore(score)}`, {
        className: 'tooltip-pico',
        direction: 'top',
        offset: [0, -tamanho / 2],
      })
      .on('click', () => emit('selecionar', pico.id))
      .addTo(camadaPicos);
  });

  // enquadra todos os picos apenas na primeira carga
  if (!enquadrado && props.picos.length) {
    const limites = L.latLngBounds(props.picos.map((p) => [p.latitude, p.longitude]));
    mapa.fitBounds(limites, { padding: [60, 60], maxZoom: 12 });
    enquadrado = true;
  }
};

/*
  Mostra o marcador tracejado da posição escolhida no formulário
*/
const desenharPosicaoEscolhida = () => {
  if (!mapa) return;
  if (marcadorNovo) {
    marcadorNovo.remove();
    marcadorNovo = null;
  }
  if (props.modoSelecao && props.posicaoEscolhida) {
    marcadorNovo = L.marker([props.posicaoEscolhida.latitude, props.posicaoEscolhida.longitude], {
      icon: L.divIcon({ className: '', iconSize: [30, 30], iconAnchor: [15, 15], html: '<div class="pin-novo"></div>' }),
      interactive: false,
    }).addTo(mapa);
  }
};

/*
  Centraliza o mapa em um pico
*/
const centralizar = (latitude, longitude) => {
  if (mapa) mapa.flyTo([latitude, longitude], Math.max(mapa.getZoom(), 12), { duration: 0.6 });
};

defineExpose({ centralizar });

onMounted(async () => {
  L = await import('leaflet');

  mapa = L.map(elementoMapa.value, { zoomControl: true, attributionControl: true })
    .setView(CENTRO_INICIAL, ZOOM_INICIAL);

  // tiles padrão do OpenStreetMap; a classe aplica um filtro CSS que os deixa
  // no tom azul-escuro do tema (ver main.css)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    className: 'tiles-escuros',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapa);

  camadaPicos = L.layerGroup().addTo(mapa);

  mapa.on('click', (evento) => {
    if (!props.modoSelecao) return;
    emit('escolherPosicao', {
      latitude: Number(evento.latlng.lat.toFixed(5)),
      longitude: Number(evento.latlng.lng.toFixed(5)),
    });
  });

  // o mapa precisa recalcular o tamanho quando o layout muda
  observadorTamanho = new ResizeObserver(() => mapa?.invalidateSize());
  observadorTamanho.observe(elementoMapa.value);

  desenharPicos();
  desenharPosicaoEscolhida();
});

onBeforeUnmount(() => {
  observadorTamanho?.disconnect();
  if (mapa) mapa.remove();
  mapa = null;
});

watch(() => [props.picos, props.selecionadoId], desenharPicos, { deep: true });
watch(() => [props.modoSelecao, props.posicaoEscolhida], desenharPosicaoEscolhida, { deep: true });
watch(() => props.modoSelecao, (ativo) => {
  elementoMapa.value?.classList.toggle('mapa-selecao', ativo);
});
</script>

<template>
  <div class="relative h-full min-h-[320px] overflow-hidden rounded-2xl border border-oceano-700/70">
    <div ref="elementoMapa" class="h-full w-full" />

    <div
      v-if="modoSelecao"
      class="pointer-events-none absolute left-1/2 top-4 z-[500] -translate-x-1/2 rounded-full bg-espuma px-4 py-2 text-sm font-semibold text-oceano-950 shadow-lg"
    >
      Clique no mar para marcar a posição do pico
    </div>

    <!-- legenda do gradiente de score -->
    <div class="absolute bottom-6 left-3 z-[500] rounded-xl border border-oceano-700 bg-oceano-950/90 px-3 py-2">
      <p class="rotulo mb-1">Score agora</p>
      <div class="h-2 w-40 rounded-full bg-gradient-to-r from-[hsl(0,80%,52%)] via-[hsl(62,80%,52%)] to-[hsl(125,80%,52%)]" />
      <div class="numeros mt-1 flex justify-between text-[11px] text-oceano-300">
        <span>0</span><span>5</span><span>10</span>
      </div>
    </div>
  </div>
</template>
