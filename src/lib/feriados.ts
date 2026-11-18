const feriadosPorAno = new Map<number, Promise<string[]>>();

function dataValida(valor: unknown, ano: number): valor is string {
  if (typeof valor !== "string" || !new RegExp(`^${ano}-\\d{2}-\\d{2}$`).test(valor)) return false;
  const [a, m, d] = valor.split("-").map(Number);
  const data = new Date(Date.UTC(a, m - 1, d));
  return data.getUTCFullYear() === a && data.getUTCMonth() === m - 1 && data.getUTCDate() === d;
}

async function buscarFeriados(ano: number): Promise<string[]> {
  const parametros = new URLSearchParams({ ano: String(ano), uf: "AL", municipio: "Maceió" });
  const resposta = await fetch(`/api/feriados?${parametros}`);
  if (!resposta.ok) throw new Error(`Calendário de feriados indisponível (HTTP ${resposta.status}).`);

  const dados: unknown = await resposta.json();
  if (typeof dados !== "object" || dados === null || !("feriados" in dados) || !Array.isArray(dados.feriados)) {
    throw new Error("O calendário de feriados retornou dados inválidos.");
  }
  const datas = dados.feriados.map((feriado: unknown) => {
    if (typeof feriado !== "object" || feriado === null || !("data" in feriado) || !dataValida(feriado.data, ano)) {
      throw new Error("O calendário de feriados retornou uma data inválida.");
    }
    return feriado.data;
  });
  return [...new Set(datas)];
}

export function carregarFeriados(ano: number): Promise<string[]> {
  const carregamento = feriadosPorAno.get(ano);
  if (carregamento) return carregamento;

  const proximaCarga = buscarFeriados(ano);
  feriadosPorAno.set(ano, proximaCarga);
  void proximaCarga.catch(() => feriadosPorAno.delete(ano));
  return proximaCarga;
}
