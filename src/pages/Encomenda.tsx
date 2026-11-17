import { CaretLeft, MagnifyingGlass, Plus, Trash, WhatsappLogo } from "@phosphor-icons/react";
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PreviaComanda } from "../components/PreviaComanda";
import { Banner, Button, Input, Radio, Select, Textarea } from "../components/ui";
import { contato, nomeCompleto, produtos, secoes } from "../data/menu";
import { registrarEvento } from "../lib/analytics";
import { buscarCep } from "../lib/cep";
import { linkWhatsApp } from "../lib/comanda";
import {
  ANTECEDENCIA_MINIMA_DIAS, FAIXAS_ENCOMENDA, MAX_ITENS, MAX_QTD, encomendaVazia, menorDataDeEncomenda, montarMensagemEncomenda,
  validarEncomenda, type CampoEncomenda, type Encomenda as DadosEncomenda, type FaixaEncomenda,
} from "../lib/encomenda";
import { mascararCep, mascararTelefone } from "../lib/formulario";
import { usePageTitle } from "../hooks/usePageTitle";

type StatusCep = "ocioso" | "buscando" | "ok" | "nao-encontrado" | "falha";
const MENSAGEM_CEP: Record<StatusCep, string> = {
  ocioso: "",
  buscando: "Buscando endereço…",
  ok: "Endereço encontrado. Confira e informe o número.",
  "nao-encontrado": "CEP não encontrado. Preencha o endereço manualmente.",
  falha: "Não foi possível buscar o CEP agora. Preencha o endereço manualmente.",
};

const nomeDoProduto = (id: string) => {
  const p = produtos.find((x) => x.id === id);
  return p ? nomeCompleto(p) : id;
};

/** Encomenda para festas e eventos: o formulário monta a mensagem e o cliente a envia pelo WhatsApp. */
export default function Encomenda() {
  usePageTitle("Encomendas");
  const [e, setE] = useState<DadosEncomenda>(encomendaVazia);
  const [tentou, setTentou] = useState(false);
  const [tocados, setTocados] = useState<Partial<Record<CampoEncomenda, boolean>>>({});
  const [statusCep, setStatusCep] = useState<StatusCep>("ocioso");
  const [revisando, setRevisando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const busca = useRef<AbortController | null>(null);
  const agora = useMemo(() => new Date(), []);
  const minimo = menorDataDeEncomenda(agora);
  const erros = useMemo(() => validarEncomenda(e, agora), [e, agora]);
  const erro = (c: CampoEncomenda) => (tentou || tocados[c] ? erros[c] : undefined);
  const entrega = e.tipo === "entrega";

  const mudar = <K extends keyof DadosEncomenda>(c: K, v: DadosEncomenda[K]) => setE((a) => ({ ...a, [c]: v }));
  const focar = (nome: string) => formRef.current?.querySelector<HTMLElement>(`[name="${nome === "itens" ? "item-0" : nome}"]`)?.focus();
  const campo = (c: Exclude<CampoEncomenda, "itens" | "faixa">, mascara?: (v: string) => string) => ({
    name: c,
    value: e[c as keyof DadosEncomenda] as string,
    onChange: (ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => mudar(c as keyof DadosEncomenda, (mascara ? mascara(ev.target.value) : ev.target.value) as never),
    onBlur: () => setTocados((t) => ({ ...t, [c]: true })),
    erro: !!erro(c),
    legenda: erro(c),
  });

  const mudarItem = (i: number, parte: Partial<DadosEncomenda["itens"][number]>) =>
    setE((a) => ({ ...a, itens: a.itens.map((it, j) => (j === i ? { ...it, ...parte } : it)) }));
  const addItem = () => setE((a) => (a.itens.length >= MAX_ITENS ? a : { ...a, itens: [...a.itens, { produtoId: "", qtd: 1 }] }));
  const removerItem = (i: number) => setE((a) => ({ ...a, itens: a.itens.filter((_, j) => j !== i) }));

  async function buscar(cep: string) {
    busca.current?.abort();
    const controle = new AbortController();
    busca.current = controle;
    setStatusCep("buscando");
    const res = await buscarCep(cep, controle.signal);
    if (controle.signal.aborted) return;
    if (res.status !== "ok") return setStatusCep(res.status);
    setStatusCep("ok");
    setE((a) => ({ ...a, rua: res.endereco.rua || a.rua, bairro: res.endereco.bairro || a.bairro, cidade: res.endereco.cidade || a.cidade, uf: res.endereco.uf || a.uf }));
  }
  function aoMudarCep(ev: ChangeEvent<HTMLInputElement>) {
    const valor = mascararCep(ev.target.value);
    mudar("cep", valor);
    const d = valor.replace(/\D/g, "");
    if (d.length === 8) void buscar(d);
    else setStatusCep("ocioso");
  }

  function revisar(ev: FormEvent) {
    ev.preventDefault();
    setTentou(true);
    const primeiro = Object.keys(erros)[0];
    if (primeiro) return focar(primeiro);
    registrarEvento("generate_lead", { origem: "encomenda" }); // sem dados pessoais
    setRevisando(true);
    window.scrollTo(0, 0);
  }

  if (revisando) {
    const mensagem = montarMensagemEncomenda(e, nomeDoProduto);
    return (
      <div className="container">
        <div className="pedido">
          <div className="pedido-topo">
            <h1 className="t-secao" id="titulo-confira">Confira sua encomenda</h1>
          </div>
          <Banner tipo="aviso">
            Ainda não enviamos nada. Ao tocar no botão, o WhatsApp abre com esta mensagem pronta. O valor é calculado pela nossa equipe e combinado por lá.
          </Banner>
          <PreviaComanda texto={mensagem} rotuloId="titulo-confira" />
          <div className="pedido__acoes">
            <a className="btn btn--primary btn--lg" href={linkWhatsApp(contato.whatsapp, mensagem)} target="_blank" rel="noopener noreferrer">
              <WhatsappLogo className="icon" aria-hidden="true" />
              Enviar encomenda no WhatsApp
            </a>
            <Button type="button" variante="outline" onClick={() => setRevisando(false)}>Voltar e editar</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="pedido">
        <div className="pedido-topo">
          <Link className="icon-btn icon-btn--destaque" to="/" aria-label="Voltar ao início">
            <CaretLeft size={20} />
          </Link>
          <h1 className="t-secao">Encomendas</h1>
        </div>
        <p className="t-corpo">
          Festas, eventos e grandes quantidades. Preencha o formulário e envie pelo WhatsApp: a nossa equipe calcula o valor e combina os detalhes com você.
        </p>

        <form className="form pedido__form" ref={formRef} onSubmit={revisar} noValidate>
          <fieldset className="pedido__secao">
            <legend className="t-subtitulo">O que você quer encomendar?</legend>
            {e.itens.map((it, i) => (
              <div className="encomenda-item" key={i}>
                <Select rotulo={`Item ${i + 1}`} name={`item-${i}`} value={it.produtoId} onChange={(ev) => mudarItem(i, { produtoId: ev.target.value })} erro={i === 0 && !!erro("itens")}>
                  <option value="">Escolha um item</option>
                  {secoes.map((s) => (
                    <optgroup label={s.nome} key={s.id}>
                      {produtos.filter((p) => (s.id === "bebidas" ? p.categoria === "bebidas" : p.prato === s.id)).map((p) => <option value={p.id} key={p.id}>{nomeCompleto(p)}</option>)}
                    </optgroup>
                  ))}
                </Select>
                <Input
                  className="encomenda-item__qtd" rotulo="Quantidade" type="number" inputMode="numeric" min={1} max={MAX_QTD} name={`qtd-${i}`}
                  value={String(it.qtd)} onChange={(ev) => mudarItem(i, { qtd: Number(ev.target.value) })}
                />
                {e.itens.length > 1 && (
                  <Button type="button" variante="outline" onClick={() => removerItem(i)} aria-label={`Remover o item ${i + 1}`}>
                    <Trash className="icon" aria-hidden="true" />
                    Remover
                  </Button>
                )}
              </div>
            ))}
            {erro("itens") && <p className="erro-msg" role="alert">{erro("itens")}</p>}
            {e.itens.length < MAX_ITENS && (
              <Button type="button" variante="outline" onClick={addItem}>
                <Plus className="icon" aria-hidden="true" />
                Adicionar outro item
              </Button>
            )}
            <Textarea rotulo="Outros itens ou detalhes (opcional)" placeholder="Ex.: 40 cuscuz de frango sem pimenta, 10 sem glúten…" maxLength={400} {...campo("outros")} />
            <div className="linha linha--ocasiao">
              <Input rotulo="Ocasião (opcional)" placeholder="Ex.: aniversário" maxLength={60} name="ocasiao" value={e.ocasiao} onChange={(ev) => mudar("ocasiao", ev.target.value)} />
              <Input rotulo="Pessoas (opcional)" placeholder="25" inputMode="numeric" maxLength={4} {...campo("pessoas", (v) => v.replace(/\D/g, "").slice(0, 4))} />
            </div>
          </fieldset>

          <fieldset className="pedido__secao">
            <legend className="t-subtitulo">Quando e como receber</legend>
            <p className="aviso-privacidade">Precisamos de {ANTECEDENCIA_MINIMA_DIAS} dias de antecedência. Atendemos de {contato.diasFuncionamento}.</p>
            <Input rotulo="Data*" type="date" min={minimo} required {...campo("data")} />
            <Select
              rotulo="Horário*" name="faixa" value={e.faixa} required erro={!!erro("faixa")} legenda={erro("faixa")}
              onChange={(ev) => mudar("faixa", ev.target.value as FaixaEncomenda)} onBlur={() => setTocados((t) => ({ ...t, faixa: true }))}
            >
              <option value="">Escolha o horário</option>
              {FAIXAS_ENCOMENDA.map((f) => <option value={f.id} key={f.id}>{f.rotulo}</option>)}
            </Select>
            <div role="radiogroup" aria-label="Recebimento" className="pedido__tipos">
              <Radio rotulo="Entrega" name="tipo" checked={entrega} onChange={() => mudar("tipo", "entrega")} />
              <Radio rotulo="Retirada na casa" name="tipo" checked={!entrega} onChange={() => mudar("tipo", "retirada")} />
            </div>
          </fieldset>

          {entrega && (
            <fieldset className="pedido__secao">
              <legend className="t-subtitulo">Endereço de entrega</legend>
              <div className="cep-linha">
                <Input rotulo="CEP*" placeholder="00000-000" inputMode="numeric" autoComplete="postal-code" required {...campo("cep")} onChange={aoMudarCep} />
                <Button variante="primary" onClick={() => void buscar(e.cep.replace(/\D/g, ""))} disabled={statusCep === "buscando"} aria-busy={statusCep === "buscando"}>
                  <MagnifyingGlass className="icon" aria-hidden="true" />
                  Buscar
                </Button>
              </div>
              <p className={`cep-status${statusCep === "nao-encontrado" || statusCep === "falha" ? " cep-status--erro" : ""}`} role="status">{MENSAGEM_CEP[statusCep]}</p>
              <Input rotulo="Rua / Condomínio / Residencial*" autoComplete="address-line1" required maxLength={80} {...campo("rua")} />
              <div className="linha linha--numero">
                <Input rotulo="Número*" required maxLength={10} {...campo("numero")} />
                <Input rotulo="Complemento (opcional)" autoComplete="address-line2" maxLength={60} name="complemento" value={e.complemento} onChange={(ev) => mudar("complemento", ev.target.value)} />
              </div>
              <Input rotulo="Bairro*" autoComplete="address-level3" required maxLength={60} {...campo("bairro")} />
              <div className="linha linha--uf">
                <Input rotulo="Cidade*" autoComplete="address-level2" required maxLength={60} {...campo("cidade")} />
                <Input rotulo="UF*" placeholder="AL" autoCapitalize="characters" required maxLength={2} {...campo("uf", (v) => v.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2))} />
              </div>
            </fieldset>
          )}

          <fieldset className="pedido__secao">
            <legend className="t-subtitulo">Seus dados</legend>
            <p className="aviso-privacidade">
              Usamos seus dados só para falar da encomenda.{" "}
              <Link to="/privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</Link>
            </p>
            <Input rotulo="Nome*" autoComplete="name" required maxLength={80} {...campo("nome")} />
            <Input rotulo="Telefone / WhatsApp*" placeholder="(82) 99999-9999" type="tel" inputMode="tel" autoComplete="tel-national" required {...campo("telefone", mascararTelefone)} />
            <Textarea rotulo="Observações (opcional)" placeholder="Alergias, restrições, horário preferido…" maxLength={400} name="observacoes" value={e.observacoes} onChange={(ev) => mudar("observacoes", ev.target.value)} />
          </fieldset>

          <Button type="submit" variante="primary" tamanho="lg" bloco>Revisar encomenda</Button>
        </form>
      </div>
    </div>
  );
}
