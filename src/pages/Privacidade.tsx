import { Link } from "react-router-dom";
import { contato } from "../data/menu";
import { empresa } from "../data/empresa";
import { Legal } from "./Legal";

export default function Privacidade() {
  return (
    <Legal titulo="Política de Privacidade">
      <p>
        Esta política explica quais dados pessoais o site da {empresa.nome} usa, para quê, com quem são compartilhados e
        como você pode exercer seus direitos, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).
      </p>

      <h2>1. Quem é o responsável</h2>
      <p>
        {empresa.nome}, em {empresa.cidade}
        {empresa.documento ? `, inscrita sob o nº ${empresa.documento}` : ""}. Fale com a gente pelo WhatsApp{" "}
        <a href={`https://wa.me/${contato.whatsapp}`}>{contato.telefoneExibicao}</a>
        {empresa.email ? ` ou pelo e-mail ${empresa.email}` : ""}.
      </p>

      <h2>2. Quais dados usamos</h2>
      <ul>
        <li><strong>Identificação e contato:</strong> nome e telefone/WhatsApp.</li>
        <li><strong>Endereço de entrega (só nos pedidos de delivery):</strong> CEP, rua, condomínio ou residencial, número, complemento, bairro, cidade, UF e ponto de referência.</li>
        <li><strong>Pedido:</strong> itens, adicionais, quantidades, valores, observações (por exemplo, alergias) e forma de pagamento, incluindo o valor para troco.</li>
        <li><strong>Dados técnicos:</strong> a hospedagem do site registra endereço IP, navegador, data e hora de acesso.</li>
      </ul>
      <p>Não pedimos número de cartão, CPF nem senha: o pagamento é feito na entrega.</p>

      <h2>3. Para que usamos e em que base legal</h2>
      <ul>
        <li>Receber, preparar e entregar o seu pedido, e falar com você sobre ele pelo WhatsApp (execução de contrato ou procedimentos preliminares, art. 7º, V).</li>
        <li>Cumprir obrigações legais e fiscais (art. 7º, II).</li>
        <li>Manter o site seguro e funcionando (legítimo interesse, art. 7º, IX).</li>
      </ul>
      <p>
        Não vendemos seus dados nem os usamos para publicidade de terceiros. Se um dia enviarmos novidades, vamos pedir a
        sua autorização antes.
      </p>

      <h2>4. Como o pedido chega até nós</h2>
      <p>
        Não existe conta nem cadastro. Os dados do pedido ficam no seu navegador até você tocar em “Enviar comanda para o
        WhatsApp”: é você quem envia a comanda ao nosso WhatsApp, e só depois disso a cozinha recebe o pedido.
      </p>

      <h2>5. O que fica guardado no seu aparelho</h2>
      <ul>
        <li>Os itens do carrinho ficam no armazenamento local do navegador, até você concluir ou limpar o pedido.</li>
        <li>Os dados que você digita no formulário ficam no armazenamento da sessão e somem quando você fecha a aba.</li>
        <li>Sua escolha de tema claro ou escuro.</li>
      </ul>
      <p>
        Não usamos cookies de rastreamento nem ferramentas de análise ou publicidade. As fontes do site são servidas por
        nós, sem chamadas ao Google Fonts.
      </p>

      <h2>6. Com quem os dados são compartilhados</h2>
      <ul>
        <li><strong>WhatsApp (Meta):</strong> recebe a comanda que você envia e a trata conforme a política própria do aplicativo.</li>
        <li><strong>ViaCEP (viacep.com.br):</strong> recebe somente o CEP que você digita, para preencher o endereço.</li>
        <li><strong>Vercel:</strong> hospeda o site e mantém registros técnicos de acesso.</li>
        <li><strong>Nossa equipe:</strong> quem prepara e entrega o pedido vê apenas o necessário para isso.</li>
      </ul>
      <p>
        WhatsApp e Vercel podem tratar dados fora do Brasil (por exemplo, nos Estados Unidos), seguindo as salvaguardas
        previstas no art. 33 da LGPD.
      </p>

      <h2>7. Por quanto tempo guardamos</h2>
      <p>
        Mantemos os dados do pedido pelo tempo necessário para atender você e cumprir obrigações legais e fiscais.
        Depois disso, eles são excluídos ou anonimizados.
      </p>

      <h2>8. Seus direitos</h2>
      <p>
        Você pode pedir: confirmação de que tratamos seus dados, acesso, correção, anonimização, bloqueio ou eliminação
        de dados desnecessários, portabilidade, informação sobre com quem compartilhamos, e a revogação de consentimentos.
        Chame no WhatsApp e responderemos em até 15 dias. Você também pode reclamar à Autoridade Nacional de Proteção de
        Dados (ANPD), em gov.br/anpd.
      </p>

      <h2>9. Segurança</h2>
      <p>
        O site usa conexão criptografada (HTTPS), política de segurança de conteúdo e coleta só o necessário para o
        pedido. Nenhum sistema é totalmente imune a falhas, e trabalhamos para reduzir riscos.
      </p>

      <h2>10. Crianças e adolescentes</h2>
      <p>O site não é destinado a menores de 18 anos. Pedidos de menores devem ser feitos com um responsável.</p>

      <h2>11. Mudanças nesta política</h2>
      <p>
        Podemos atualizar esta página. A data no topo mostra a última revisão. Veja também os{" "}
        <Link to="/termos">Termos de Uso</Link>.
      </p>
    </Legal>
  );
}
