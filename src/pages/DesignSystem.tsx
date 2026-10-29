import { Check } from "@phosphor-icons/react";
import { useState } from "react";
import { Avatar, Badge, Banner, Breadcrumb, Button, Checkbox, EmptyState, Input, Radio, Select, Stat, Switch, Tag, Textarea, Toast } from "../components/ui";

const tamanhos = ["sm", "md", "lg"] as const;
const variantes = ["primary", "outline", "ghost"] as const;

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section style={{ display: "grid", gap: "var(--esp-16)", marginBottom: "var(--esp-48)" }}>
      <h2 className="t-secao">{titulo}</h2>
      {children}
    </section>
  );
}
const linha: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: "var(--esp-16)", alignItems: "flex-start" };

/** Referência visual dos componentes (rota /design-system) para conferir com o Figma. */
export default function DesignSystem() {
  const [aba, setAba] = useState(0);
  return (
    <div className="container section">
      <h1 className="t-pagina" style={{ marginBottom: "var(--esp-32)" }}>Design System</h1>

      <Bloco titulo="Botões · 32 / 40 / 48">
        {variantes.map((v) => (
          <div key={v} style={{ ...linha, alignItems: "center" }}>
            {tamanhos.map((t) => <Button key={t} variante={v} tamanho={t}>Botão</Button>)}
            {tamanhos.map((t) => <Button key={`i${t}`} variante={v} tamanho={t}><Check className="icon" />Botão</Button>)}
            {tamanhos.map((t) => <Button key={`d${t}`} variante={v} tamanho={t} disabled>Botão</Button>)}
          </div>
        ))}
      </Bloco>

      <Bloco titulo="Campos · 32 / 40 / 48">
        {tamanhos.map((t) => (
          <div key={t} style={linha}>
            <Input rotulo="Rótulo" legenda="Legenda" placeholder="Digite aqui" tamanho={t} busca />
            <Input rotulo="Rótulo" legenda="Legenda" defaultValue="Texto digitado" tamanho={t} busca />
            <Input rotulo="Rótulo" legenda="Legenda" placeholder="Digite aqui" tamanho={t} busca erro />
            <Input rotulo="Rótulo" legenda="Legenda" placeholder="Digite aqui" tamanho={t} busca disabled />
            <Select rotulo="Rótulo" legenda="Legenda" tamanho={t}><option>Selecione uma opção</option><option>Opção</option></Select>
            <Textarea rotulo="Rótulo" legenda="Legenda" placeholder="Digite suas observações" tamanho={t} />
          </div>
        ))}
      </Bloco>

      <Bloco titulo="Controles">
        <div style={{ ...linha, gap: "var(--esp-48)" }}>
          <div style={{ display: "grid", gap: "var(--esp-16)" }}>
            <Checkbox rotulo="Texto do rótulo" /><Checkbox rotulo="Texto do rótulo" defaultChecked />
            <Checkbox rotulo="Texto do rótulo" indeterminado /><Checkbox rotulo="Texto do rótulo" erro /><Checkbox rotulo="Texto do rótulo" disabled />
          </div>
          <div style={{ display: "grid", gap: "var(--esp-16)" }}>
            <Switch rotulo="Texto do rótulo" /><Switch rotulo="Texto do rótulo" defaultChecked /><Switch rotulo="Texto do rótulo" disabled />
          </div>
          <div style={{ display: "grid", gap: "var(--esp-16)" }}>
            <Radio rotulo="Texto do rótulo" name="r" /><Radio rotulo="Texto do rótulo" name="r" defaultChecked /><Radio rotulo="Texto do rótulo" name="r2" disabled />
          </div>
        </div>
      </Bloco>

      <Bloco titulo="Feedback">
        <div style={linha}>
          <Toast tipo="sucesso" titulo="Título do aviso" mensagem="Mensagem curta com a explicação do que aconteceu." onFechar={() => {}} />
          <Toast tipo="aviso" titulo="Título do aviso" mensagem="Mensagem curta com a explicação do que aconteceu." onFechar={() => {}} />
          <Toast tipo="erro" titulo="Título do aviso" mensagem="Mensagem curta com a explicação do que aconteceu." onFechar={() => {}} />
          <Toast tipo="info" titulo="Título do aviso" mensagem="Mensagem curta com a explicação do que aconteceu." onFechar={() => {}} />
        </div>
        <div style={{ display: "grid", gap: "var(--esp-12)", maxWidth: 480 }}>
          <Banner tipo="sucesso" onFechar={() => {}}>Mensagem do aviso em uma ou duas linhas.</Banner>
          <Banner tipo="aviso" onFechar={() => {}}>Mensagem do aviso em uma ou duas linhas.</Banner>
          <Banner tipo="erro" onFechar={() => {}}>Mensagem do aviso em uma ou duas linhas.</Banner>
          <Banner tipo="info" onFechar={() => {}}>Mensagem do aviso em uma ou duas linhas.</Banner>
        </div>
        <EmptyState titulo="Nenhum resultado encontrado." texto="Tente ajustar os filtros ou buscar por outro termo." acao={<Button variante="outline">Limpar filtros</Button>} />
      </Bloco>

      <Bloco titulo="Exibição">
        <div style={{ ...linha, alignItems: "center" }}>
          <Avatar iniciais="RR" tamanho={24} /><Avatar iniciais="RR" /><Avatar iniciais="RR" tamanho={48} /><Avatar iniciais="RR" tamanho={64} />
          <Avatar tamanho={24} /><Avatar /><Avatar tamanho={48} /><Avatar tamanho={64} />
        </div>
        <div style={linha}>
          <Badge ponto>Badge</Badge><Badge ponto variante="aviso">Badge</Badge><Badge ponto variante="sucesso">Badge</Badge>
          <Badge ponto variante="erro">Badge</Badge><Badge ponto variante="info">Badge</Badge>
        </div>
        <div style={linha}>
          <Tag onRemover={() => {}}>Etiqueta</Tag><Tag variante="erro" onRemover={() => {}}>Etiqueta</Tag><Tag variante="outline" onRemover={() => {}}>Etiqueta</Tag>
        </div>
        <div style={linha}>
          <Stat rotulo="Rótulo do indicador" valor="128" nota="vs. período anterior" />
          <Stat marca rotulo="Rótulo do indicador" valor="128" nota="vs. período anterior" />
        </div>
      </Bloco>

      <Bloco titulo="Navegação">
        <div role="tablist" style={{ display: "flex", borderBottom: "2px solid var(--borda-sutil)", maxWidth: 480 }}>
          {["Visão geral", "Detalhes", "Histórico", "Configurações"].map((t, i) => (
            <button key={t} role="tab" className="aba" aria-selected={aba === i} onClick={() => setAba(i)} style={{ marginBottom: -2 }}>{t}</button>
          ))}
        </div>
        <Breadcrumb itens={["Painel", "Clientes", "Detalhe"]} />
      </Bloco>
    </div>
  );
}
