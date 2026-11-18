import { MapPin, MagnifyingGlass } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { contato } from "../data/menu";
import { registrarEvento } from "../lib/analytics";
import { calcularCobertura, calcularCoberturaPorLocalizacao } from "../lib/geocep";
import { mascararCep } from "../lib/formulario";
import { linkWhatsAppContato } from "../lib/whatsapp";
import type { Cobertura } from "../lib/area";
import { ResultadoEntrega, type EstadoEntrega } from "./ResultadoEntrega";
import { Button, Input } from "./ui";

const paraEstado = (c: Cobertura): EstadoEntrega =>
  c.situacao === "dentro" ? { tipo: "dentro", distanciaKm: c.distanciaKm, taxa: c.taxa }
  : c.situacao === "fora" ? { tipo: "fora", distanciaKm: c.distanciaKm }
  : { tipo: "indisponivel" };

/** "Digite seu CEP e veja a taxa": o cliente descobre se entregamos e quanto custa antes de montar o pedido. */
export function ConsultaTaxa() {
  const [cep, setCep] = useState("");
  const [estado, setEstado] = useState<EstadoEntrega | null>(null);
  const [avisoLocal, setAvisoLocal] = useState("");
  const busca = useRef<AbortController | null>(null);
  useEffect(() => () => busca.current?.abort(), []);

  async function consultar(digitos: string) {
    busca.current?.abort();
    const controle = new AbortController();
    busca.current = controle;
    setAvisoLocal("");
    setEstado({ tipo: "calculando" });
    const cobertura = await calcularCobertura(digitos, controle.signal);
    if (controle.signal.aborted) return;
    setEstado(paraEstado(cobertura));
    registrarEvento("consulta_entrega", { origem: "home", resultado: cobertura.situacao, ...(cobertura.situacao === "dentro" ? { taxa: cobertura.taxa } : {}) });
  }

  function aoMudar(valor: string) {
    const mascarado = mascararCep(valor);
    setCep(mascarado);
    const d = mascarado.replace(/\D/g, "");
    if (d.length === 8) void consultar(d);
    else { busca.current?.abort(); setEstado(null); setAvisoLocal(""); }
  }

  function aoEnviar(ev: FormEvent) {
    ev.preventDefault();
    const d = cep.replace(/\D/g, "");
    if (d.length === 8) void consultar(d);
  }

  async function usarLocalizacao() {
    setAvisoLocal("");
    setEstado({ tipo: "calculando" });
    const r = await calcularCoberturaPorLocalizacao();
    if (!r.ok) {
      setEstado(null);
      setAvisoLocal(r.motivo === "negado" ? "Sem a permissão de localização não dá para calcular. Digite o CEP." : "Não foi possível usar a localização agora. Digite o CEP.");
      return;
    }
    setEstado(paraEstado(r.cobertura));
    registrarEvento("consulta_entrega", { origem: "home_localizacao", resultado: r.cobertura.situacao, ...(r.cobertura.situacao === "dentro" ? { taxa: r.cobertura.taxa } : {}) });
  }

  const falouFora = estado?.tipo === "fora" || estado?.tipo === "indisponivel";
  return (
    <form className="consulta-taxa" onSubmit={aoEnviar} noValidate>
      <div className="cep-linha">
        <Input
          rotulo="Seu CEP" placeholder="00000-000" inputMode="numeric" autoComplete="postal-code" name="cep-consulta"
          value={cep} onChange={(e) => aoMudar(e.target.value)}
        />
        <Button type="submit" variante="primary" disabled={cep.replace(/\D/g, "").length !== 8}>
          <MagnifyingGlass className="icon" aria-hidden="true" />
          Ver taxa
        </Button>
      </div>
      {avisoLocal && <p className="cep-status cep-status--erro" role="status">{avisoLocal}</p>}
      {estado && (
        <ResultadoEntrega
          estado={estado}
          acoes={falouFora && (
            <>
              <Button type="button" variante="outline" onClick={() => void usarLocalizacao()}>
                <MapPin className="icon" aria-hidden="true" />
                Estou no endereço: usar minha localização
              </Button>
              <a className="btn btn--outline btn--md" href={linkWhatsAppContato(contato.whatsapp, "area")} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
            </>
          )}
        />
      )}
    </form>
  );
}
