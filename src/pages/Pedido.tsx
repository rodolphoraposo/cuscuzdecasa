import { CaretLeft, Check, CreditCard, MagnifyingGlass, Minus, Money, PixLogo, Plus } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AvisoEncerrado } from "../components/AvisoEncerrado";
import { FotoProduto } from "../components/FotoProduto";
import { Banner, Button, ButtonLink, Checkbox, EmptyState, Input, Textarea } from "../components/ui";
import { useCart } from "../context/CartContext";
import { adicionais, contato, formatarPreco, nomeCompleto, taxaEntrega } from "../data/menu";
import { buscarCep } from "../lib/cep";
import { janelasEntrega } from "../lib/entrega";
import { useEntrega } from "../hooks/useEntrega";
import {
  carregarRascunho, mascararCep, mascararTelefone, salvarRascunho, validarPedido,
  type Campo, type Rascunho,
} from "../lib/formulario";
import { usePageTitle } from "../hooks/usePageTitle";

type StatusCep = "ocioso" | "buscando" | "ok" | "nao-encontrado" | "falha";

const MENSAGEM_CEP: Record<StatusCep, string> = {
  ocioso: "",
  buscando: "Buscando endereço…",
  ok: "Endereço encontrado. Confira e informe o número.",
  "nao-encontrado": "CEP não encontrado. Preencha o endereço manualmente.",
  falha: "Não foi possível buscar o CEP agora. Preencha o endereço manualmente.",
};

const FORMAS = [
  { id: "pix", nome: "Pix", Icone: PixLogo },
  { id: "dinheiro", nome: "Dinheiro", Icone: Money },
  { id: "cartao", nome: "Cartão na entrega", Icone: CreditCard },
] as const;

const soDigitos = (v: string) => v.replace(/\D/g, "");

export default function Pedido() {
  usePageTitle("Seu pedido");
  const navigate = useNavigate();
  const { linhas, totalPreco, alterar } = useCart();
  const total = Math.round((totalPreco + taxaEntrega) * 100) / 100;
  const { dia } = useEntrega();
  const fechado = dia === null; // pedidos de hoje encerrados

  const [r, setR] = useState<Rascunho>(carregarRascunho);
  const [tentou, setTentou] = useState(false);
  const [tocados, setTocados] = useState<Partial<Record<Campo, boolean>>>({});
  const [statusCep, setStatusCep] = useState<StatusCep>("ocioso");
  const formRef = useRef<HTMLFormElement>(null);
  const busca = useRef<AbortController | null>(null);
  const ultimoCep = useRef("");

  useEffect(() => salvarRascunho(r), [r]);
  useEffect(() => () => busca.current?.abort(), []);

  const erros = useMemo(() => validarPedido(r, total), [r, total]);
  const erro = (c: Campo) => (tentou || tocados[c] ? erros[c] : undefined);
  const mudar = (c: keyof Rascunho, v: string | boolean) => setR((a) => ({ ...a, [c]: v }));
  const focar = (nome: string) => formRef.current?.querySelector<HTMLElement>(`[name="${nome}"]`)?.focus();

  const campo = (c: Exclude<Campo, "pagamento">, mascara?: (v: string) => string) => ({
    name: c,
    value: r[c],
    onChange: (e: ChangeEvent<HTMLInputElement>) => mudar(c, mascara ? mascara(e.target.value) : e.target.value),
    onBlur: () => setTocados((t) => ({ ...t, [c]: true })),
    erro: !!erro(c),
    legenda: erro(c),
  });

  async function buscar(cep: string) {
    if (cep.length !== 8) {
      setTocados((t) => ({ ...t, cep: true }));
      focar("cep");
      return;
    }
    busca.current?.abort();
    const controle = new AbortController();
    busca.current = controle;
    ultimoCep.current = cep;
    setStatusCep("buscando");
    const res = await buscarCep(cep, controle.signal);
    if (controle.signal.aborted) return;
    if (res.status === "ok") {
      setR((a) => ({ ...a, ...res.endereco }));
      setStatusCep("ok");
      focar("numero");
    } else {
      setStatusCep(res.status);
    }
  }

  function aoMudarCep(e: ChangeEvent<HTMLInputElement>) {
    const valor = mascararCep(e.target.value);
    mudar("cep", valor);
    const d = soDigitos(valor);
    if (d.length === 8 && d !== ultimoCep.current) void buscar(d); // busca sozinho ao completar
    else if (d.length < 8) setStatusCep("ocioso");
  }

  function enviar(ev: FormEvent) {
    ev.preventDefault();
    if (fechado) return;
    setTentou(true);
    const primeiro = Object.keys(erros)[0];
    if (primeiro) return focar(primeiro);
    salvarRascunho(r);
    navigate("/pedido/finalizar");
  }

  if (linhas.length === 0) {
    return (
      <section className="section container">
        <EmptyState
          titulo="Seu pedido está vazio"
          texto="Escolha seus cuscuz no cardápio para começar."
          acao={<ButtonLink to="/cardapio">Ver cardápio</ButtonLink>}
        />
      </section>
    );
  }

  const comErros = tentou && Object.keys(erros).length > 0;

  return (
    <>
      <div className="container">
        <div className="pedido">
          <div className="pedido-topo">
            <Link className="icon-btn icon-btn--destaque" to="/cardapio" aria-label="Voltar ao cardápio">
              <CaretLeft size={20} />
            </Link>
            <h1 className="t-secao">Seu pedido</h1>
          </div>

          <AvisoEncerrado />

          <section aria-labelledby="titulo-itens">
            <h2 className="t-subtitulo" id="titulo-itens">Itens</h2>
            <ul className="pedido-itens">
              {linhas.map((l) => (
                <li className="pedido-item" key={l.chave}>
                  <FotoProduto produto={l.produto} decorativa className={l.produto.ajuste === "contain" ? "contain" : ""} />
                  <div className="pedido-item__corpo">
                    <h3 className="pedido-item__nome">{nomeCompleto(l.produto)}</h3>
                    {l.acompanhamentoNome && <p className="pedido-item__extra">Acompanhamento: {l.acompanhamentoNome}</p>}
                    {l.extras.map((e) => (
                      <p className="pedido-item__extra" key={e}>+ {adicionais.find((a) => a.id === e)?.nome}</p>
                    ))}
                    <div className="pedido-item__rodape">
                      <span className="preco">{formatarPreco(l.subtotal)}</span>
                      <div className="stepper" role="group" aria-label={`Quantidade de ${nomeCompleto(l.produto)}`}>
                        <button
                          type="button"
                          onClick={() => alterar(l.chave, -1)}
                          aria-label={l.quantidade === 1 ? `Remover ${nomeCompleto(l.produto)} do pedido` : `Diminuir quantidade de ${nomeCompleto(l.produto)}`}
                        >
                          <Minus size={16} />
                        </button>
                        <output aria-live="polite">{l.quantidade}</output>
                        <button type="button" onClick={() => alterar(l.chave, 1)} aria-label={`Aumentar quantidade de ${nomeCompleto(l.produto)}`}>
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Link className="pedido__mais" to="/cardapio">Adicionar mais itens</Link>
          </section>

          <form id="form-pedido" className="form pedido__form" ref={formRef} onSubmit={enviar} noValidate>
            {comErros && <Banner tipo="erro">Revise os campos destacados para continuar.</Banner>}

            <fieldset className="pedido__secao">
              <legend className="t-subtitulo">Seus dados</legend>
              <p className="aviso-privacidade">
                Usamos seus dados só para entregar o pedido.{" "}
                <Link to="/privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</Link>
              </p>
              <Input rotulo="Nome*" placeholder="Digite aqui" autoComplete="name" required maxLength={80} {...campo("nome")} />
              <Input rotulo="Telefone / WhatsApp*" placeholder="(82) 99999-9999" type="tel" inputMode="tel" autoComplete="tel-national" required {...campo("telefone", mascararTelefone)} />
            </fieldset>

            <fieldset className="pedido__secao">
              <legend className="t-subtitulo">Endereço de entrega</legend>
              <div className="cep-linha">
                <Input
                  rotulo="CEP*" placeholder="00000-000" inputMode="numeric" autoComplete="postal-code" required
                  {...campo("cep")} onChange={aoMudarCep}
                />
                <Button variante="primary" onClick={() => void buscar(soDigitos(r.cep))} disabled={statusCep === "buscando"} aria-busy={statusCep === "buscando"}>
                  <MagnifyingGlass className="icon" aria-hidden="true" />
                  Buscar
                </Button>
              </div>
              <p className={`cep-status${statusCep === "nao-encontrado" || statusCep === "falha" ? " cep-status--erro" : ""}`} role="status">
                {MENSAGEM_CEP[statusCep]}
              </p>
              <Input rotulo="Rua / Condomínio / Residencial*" placeholder="Digite aqui" autoComplete="address-line1" required maxLength={80} {...campo("rua")} />
              <div className="linha linha--numero">
                <Input rotulo="Número*" placeholder="Digite aqui" required maxLength={10} {...campo("numero")} />
                <Input rotulo="Complemento (bloco e apto)*" placeholder="Digite aqui" autoComplete="address-line2" required maxLength={60} {...campo("complemento")} />
              </div>
              <Input rotulo="Bairro*" placeholder="Digite aqui" autoComplete="address-level3" required maxLength={60} {...campo("bairro")} />
              <div className="linha linha--uf">
                <Input rotulo="Cidade*" placeholder="Digite aqui" autoComplete="address-level2" required maxLength={60} {...campo("cidade")} />
                <Input
                  rotulo="UF*" placeholder="AL" autoComplete="address-level1" autoCapitalize="characters" required maxLength={2}
                  {...campo("uf", (v) => v.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2))}
                />
              </div>
              <Input
                rotulo="Ponto de referência (opcional)" placeholder="Digite aqui" maxLength={80} name="referencia"
                value={r.referencia} onChange={(e) => mudar("referencia", e.target.value)}
              />
            </fieldset>

            <fieldset className="pedido__secao" aria-describedby={erro("horario") ? "erro-horario" : undefined}>
              <legend className="t-subtitulo">Horário de entrega</legend>
              <p className="aviso-privacidade">
                Escolha a faixa em que prefere receber ({dia ?? "hoje"}). Pedidos até as {contato.horarioPedidos}, entrega das {contato.horarioEntrega}.
              </p>
              <div className={`pagto-lista pagto-lista--grade${erro("horario") ? " pagto-lista--erro" : ""}`}>
                {janelasEntrega.map((j) => (
                  <label className="pagto" key={j.id}>
                    <input
                      type="radio" name="horario" value={j.id} checked={r.horario === j.id}
                      onChange={() => { mudar("horario", j.id); setTocados((t) => ({ ...t, horario: true })); }}
                    />
                    <span className="pagto__nome">{j.rotulo}</span>
                    <span className="pagto__bolinha" aria-hidden="true" />
                  </label>
                ))}
              </div>
              {erro("horario") && <p className="erro-msg" id="erro-horario">{erro("horario")}</p>}
            </fieldset>

            <fieldset className="pedido__secao" aria-describedby={erro("pagamento") ? "erro-pagamento" : undefined}>
              <legend className="t-subtitulo">Forma de pagamento</legend>
              <div className={`pagto-lista${erro("pagamento") ? " pagto-lista--erro" : ""}`}>
                {FORMAS.map(({ id, nome, Icone }) => (
                  <label className="pagto" key={id}>
                    <input
                      type="radio" name="pagamento" value={id} checked={r.pagamento === id}
                      onChange={() => { mudar("pagamento", id); setTocados((t) => ({ ...t, pagamento: true })); }}
                    />
                    <Icone className="icon" size={24} aria-hidden="true" />
                    <span className="pagto__nome">{nome}</span>
                    <span className="pagto__bolinha" aria-hidden="true" />
                  </label>
                ))}
              </div>
              {erro("pagamento") && <p className="erro-msg" id="erro-pagamento">{erro("pagamento")}</p>}

              {r.pagamento === "dinheiro" && (
                <>
                  <Input
                    rotulo="Troco para quanto?" placeholder="Ex.: 50,00" inputMode="decimal" disabled={r.semTroco}
                    {...campo("trocoTexto")} erro={!r.semTroco && !!erro("trocoTexto")} legenda={r.semTroco ? undefined : erro("trocoTexto")}
                  />
                  <Checkbox
                    rotulo="Não precisa de troco" checked={r.semTroco}
                    onChange={(e) => setR((a) => ({ ...a, semTroco: e.target.checked, trocoTexto: e.target.checked ? "" : a.trocoTexto }))}
                  />
                </>
              )}
            </fieldset>

            <fieldset className="pedido__secao">
              <legend className="t-subtitulo">Observações do pedido</legend>
              <Textarea
                rotulo="Observações (opcional)" placeholder="Digite suas observações" maxLength={300} name="observacoes"
                value={r.observacoes} onChange={(e) => mudar("observacoes", e.target.value)}
              />
            </fieldset>
          </form>

          <section aria-labelledby="titulo-resumo">
            <h2 className="t-subtitulo" id="titulo-resumo">Resumo</h2>
            <dl className="resumo">
              <div><dt>Subtotal</dt><dd>{formatarPreco(totalPreco)}</dd></div>
              <div><dt>Entrega</dt><dd>{formatarPreco(taxaEntrega)}</dd></div>
              <div className="resumo__total"><dt>Total</dt><dd>{formatarPreco(total)}</dd></div>
            </dl>
          </section>
        </div>
      </div>

      <div className="detail-bar">
        <div className="container detail-bar__inner">
          <Button type="submit" form="form-pedido" tamanho="lg" bloco disabled={fechado}>
            <Check className="icon" aria-hidden="true" />
            Finalizar pedido · {formatarPreco(total)}
          </Button>
        </div>
      </div>
    </>
  );
}
