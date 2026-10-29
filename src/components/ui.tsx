import {
  CaretDown, CaretRight, Check, Info, Minus, Warning, X, MagnifyingGlass, User,
} from "@phosphor-icons/react";
import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Link } from "react-router-dom";

type Tamanho = "sm" | "md" | "lg";

/* ---------- Botão ---------- */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primary" | "outline" | "ghost" | "soft";
  tamanho?: Tamanho;
  bloco?: boolean;
}
export function Button({ variante = "primary", tamanho = "md", bloco, className = "", ...rest }: ButtonProps) {
  return <button type="button" className={`btn btn--${variante} btn--${tamanho}${bloco ? " btn--block" : ""} ${className}`} {...rest} />;
}
export function ButtonLink({ to, variante = "primary", tamanho = "md", bloco, className = "", children }: {
  to: string; variante?: ButtonProps["variante"]; tamanho?: Tamanho; bloco?: boolean; className?: string; children: ReactNode;
}) {
  return <Link to={to} className={`btn btn--${variante} btn--${tamanho}${bloco ? " btn--block" : ""} ${className}`}>{children}</Link>;
}

/* ---------- Campos ---------- */
interface FieldBase { rotulo: string; legenda?: string; erro?: boolean; tamanho?: Tamanho }

function Field({ rotulo, legenda, erro, id, children }: FieldBase & { id: string; children: ReactNode }) {
  return (
    <div className={`field${erro ? " field--erro" : ""}`}>
      <label className="field__label" htmlFor={id}>{rotulo}</label>
      {children}
      {legenda && <span className="field__legenda" id={`${id}-legenda`}>{legenda}</span>}
    </div>
  );
}

export function Input({ rotulo, legenda, erro, tamanho = "md", busca, ...rest }: FieldBase & { busca?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Field rotulo={rotulo} legenda={legenda} erro={erro} id={id}>
      <div className={`control control--${tamanho}`}>
        {busca && <MagnifyingGlass className="icon" />}
        <input id={id} aria-invalid={erro} aria-describedby={legenda ? `${id}-legenda` : undefined} {...rest} />
      </div>
    </Field>
  );
}

export function Select({ rotulo, legenda, erro, tamanho = "md", children, ...rest }: FieldBase & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Field rotulo={rotulo} legenda={legenda} erro={erro} id={id}>
      <div className={`control control--${tamanho}`}>
        <select id={id} aria-invalid={erro} {...rest}>{children}</select>
        <CaretDown className="icon" />
      </div>
    </Field>
  );
}

export function Textarea({ rotulo, legenda, erro, tamanho = "md", ...rest }: FieldBase & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Field rotulo={rotulo} legenda={legenda} erro={erro} id={id}>
      <div className={`control control--area control--${tamanho}`}>
        <textarea id={id} aria-invalid={erro} {...rest} />
      </div>
    </Field>
  );
}

/* ---------- Escolhas ---------- */
interface ChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> { rotulo: string; erro?: boolean; indeterminado?: boolean }

export function Checkbox({ rotulo, erro, indeterminado, ...rest }: ChoiceProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminado; }, [indeterminado]);
  return (
    <label className={`choice${erro ? " choice--erro" : ""}`}>
      <input ref={ref} type="checkbox" {...rest} />
      <span className="choice__box"><Check className="icon icon--check" /><Minus className="icon icon--minus" /></span>
      {rotulo}
    </label>
  );
}
export function Radio({ rotulo, erro, ...rest }: ChoiceProps) {
  return (
    <label className={`choice choice--radio${erro ? " choice--erro" : ""}`}>
      <input type="radio" {...rest} />
      <span className="choice__box" />
      {rotulo}
    </label>
  );
}
export function Switch({ rotulo, ...rest }: ChoiceProps) {
  return (
    <label className="choice choice--switch">
      <input type="checkbox" role="switch" {...rest} />
      <span className="choice__box" />
      {rotulo}
    </label>
  );
}

/* ---------- Avisos ---------- */
type TipoAviso = "sucesso" | "aviso" | "erro" | "info";
const iconeAviso = { sucesso: Check, aviso: Warning, erro: X, info: Info } as const;

export function Toast({ tipo, titulo, mensagem, onFechar }: { tipo: TipoAviso; titulo: string; mensagem: string; onFechar?: () => void }) {
  const Icone = iconeAviso[tipo];
  return (
    <div className={`toast aviso--${tipo}`} role={tipo === "erro" ? "alert" : "status"}>
      <Icone className="icon icon--tipo" />
      <div><p className="toast__titulo">{titulo}</p><p className="toast__msg">{mensagem}</p></div>
      {onFechar && <button type="button" className="aviso__fechar" aria-label="Fechar aviso" onClick={onFechar}><X /></button>}
    </div>
  );
}
export function Banner({ tipo, children, onFechar }: { tipo: TipoAviso; children: ReactNode; onFechar?: () => void }) {
  const Icone = iconeAviso[tipo];
  return (
    <div className={`banner aviso--${tipo}`} role={tipo === "erro" ? "alert" : "status"}>
      <Icone className="icon icon--tipo" />
      <span>{children}</span>
      {onFechar && <button type="button" className="aviso__fechar" aria-label="Fechar aviso" onClick={onFechar}><X /></button>}
    </div>
  );
}
export function EmptyState({ titulo, texto, acao }: { titulo: string; texto: string; acao?: ReactNode }) {
  return (
    <div className="vazio">
      <div className="vazio__icone"><MagnifyingGlass className="icon" /></div>
      <h3 className="t-subtitulo">{titulo}</h3>
      <p className="t-corpo">{texto}</p>
      {acao}
    </div>
  );
}

/* ---------- Exibição ---------- */
export function Badge({ children, variante, ponto }: { children: ReactNode; variante?: "marca" | TipoAviso; ponto?: boolean }) {
  return <span className={`badge${variante ? ` badge--${variante}` : ""}${ponto ? " badge--ponto" : ""}`}>{children}</span>;
}
export function Tag({ children, variante, onRemover }: { children: ReactNode; variante?: "erro" | "outline"; onRemover?: () => void }) {
  return (
    <span className={`tag${variante ? ` tag--${variante}` : ""}`}>
      {children}
      {onRemover && <button type="button" aria-label="Remover" onClick={onRemover}><X className="icon" /></button>}
    </span>
  );
}
export function Avatar({ iniciais, tamanho = 32 }: { iniciais?: string; tamanho?: 24 | 32 | 48 | 64 }) {
  return (
    <span className={`avatar avatar--${tamanho}${iniciais ? "" : " avatar--neutro"}`} aria-hidden="true">
      {iniciais ?? <User size={tamanho === 24 ? 16 : tamanho === 32 ? 20 : 24} />}
    </span>
  );
}
export function Stat({ rotulo, valor, nota, marca }: { rotulo: string; valor: string; nota?: string; marca?: boolean }) {
  return (
    <div className={`stat${marca ? " stat--marca" : ""}`}>
      <span className="t-rotulo">{rotulo}</span>
      <span className="stat__valor">{valor}</span>
      {nota && <span className="t-legenda">{nota}</span>}
    </div>
  );
}

/* ---------- Navegação ---------- */
export function Breadcrumb({ itens }: { itens: string[] }) {
  return (
    <nav aria-label="Você está aqui" className="breadcrumb">
      {itens.map((t, i) => (
        <span key={t} style={{ display: "contents" }}>
          {i > 0 && <CaretRight aria-hidden="true" />}
          <span aria-current={i === itens.length - 1 ? "page" : undefined}>{t}</span>
        </span>
      ))}
    </nav>
  );
}

