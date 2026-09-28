/*
  --------------------------------------------------------------------------------------
  Comunicação com a Minhas Ondas API: uma função por operação HTTP.
  O endereço vem da configuração pública do Nuxt (NUXT_PUBLIC_API_URL).
  --------------------------------------------------------------------------------------
*/
export const useApi = () => {
  const API = useRuntimeConfig().public.apiUrl;

  /*
    Executa a requisição e converte a resposta. O fetch só rejeita em falha de
    rede; respostas 4xx/5xx viram erro com a mensagem devolvida pela API.
  */
  const requisitar = async (caminho, opcoes = {}) => {
    let resposta;
    try {
      resposta = await fetch(`${API}${caminho}`, opcoes);
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Não foi possível conectar à API. Verifique se ela está rodando.');
    }

    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      const detalhe = dados.detalhes?.[0];
      const mensagem = dados.mensagem || 'Erro ao comunicar com a API.';
      throw new Error(detalhe ? `${mensagem}: ${detalhe.loc?.join('.')} — ${detalhe.msg}` : mensagem);
    }
    return dados;
  };

  /*
    Monta o FormData com as chaves em português esperadas pela API
  */
  const montarFormulario = (dados) => {
    const formData = new FormData();
    Object.entries(dados).forEach(([chave, valor]) => {
      if (valor !== null && valor !== undefined && valor !== '') formData.append(chave, valor);
    });
    return formData;
  };

  // GET: lista os picos com a condição e o score da hora atual
  const listarPicos = () => requisitar('/picos', { method: 'get' });

  // GET: detalhe do pico com todas as horas coletadas
  const buscarPico = (id) => requisitar(`/pico?id=${encodeURIComponent(id)}`, { method: 'get' });

  // GET: ranking dos picos para um momento (sem momento, a API escolhe o padrão)
  const buscarRanking = (momento) => {
    const query = momento ? `?momento=${encodeURIComponent(momento)}` : '';
    return requisitar(`/ranking${query}`, { method: 'get' });
  };

  // POST: adiciona um novo pico
  const adicionarPico = (dados) => requisitar('/pico', {
    method: 'post',
    body: montarFormulario(dados),
  });

  // PUT: atualiza um pico existente
  const atualizarPico = (id, dados) => requisitar(`/pico?id=${encodeURIComponent(id)}`, {
    method: 'put',
    body: montarFormulario(dados),
  });

  // DELETE: remove um pico
  const removerPico = (id) => requisitar(`/pico?id=${encodeURIComponent(id)}`, {
    method: 'delete',
  });

  return {
    listarPicos,
    buscarPico,
    buscarRanking,
    adicionarPico,
    atualizarPico,
    removerPico,
  };
};
