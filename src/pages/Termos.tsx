import { Link } from "react-router-dom";
import { adicionais, condominios, contato, taxaEntrega } from "../data/menu";
import { empresa } from "../data/empresa";
import { Legal } from "./Legal";

export default function Termos() {
  const zap = <a href={`https://wa.me/${contato.whatsapp}`}>{contato.telefoneExibicao}</a>;
  return (
    <Legal titulo="Termos de Uso">
      <p>
        Ao usar o site da {empresa.nome}, você concorda com estes termos. Se não concordar, não faça o pedido.
      </p>

      <h2>1. O que é o serviço</h2>
      <p>
        Cardápio digital para pedir cuscuz recheado, doces e bebidas com entrega em {empresa.cidade}. O pedido é montado
        no site e enviado a nós por uma comanda no WhatsApp.
      </p>

      <h2>2. Como fazer um pedido</h2>
      <ul>
        <li>Escolha os itens e os adicionais, informe seus dados e o endereço, e confira o resumo.</li>
        <li>Toque em “Finalizar pedido” e depois em “Enviar comanda para o WhatsApp”.</li>
        <li>A cozinha só recebe o pedido depois que a comanda é enviada. Fique de olho no WhatsApp para qualquer ajuste.</li>
      </ul>

      <h2>3. Horários e área de entrega</h2>
      <p>
        Funcionamos de {contato.diasFuncionamento}. Recebemos pedidos até as {contato.horarioPedidos} e entregamos das {contato.horarioEntrega}. Entregamos nos
        condomínios da Serraria: {condominios.join(", ")}. Se o seu não está na lista, chame no WhatsApp {zap}.{" "}
        {taxaEntrega === 0 ? "No momento, a entrega não tem taxa." : null}
      </p>
      <p>
        Ao finalizar, você escolhe entre delivery e retirada na casa, e a faixa de horário (de 1 hora). {empresa.retiradaInstrucao}{" "}
        Fazemos o possível para cumprir o horário, mas ele pode variar um pouco.
      </p>

      <h2>4. Preços e pagamento</h2>
      <ul>
        <li>Os preços são em reais e valem os mostrados no momento do pedido. Eles podem mudar, sem afetar pedidos já enviados.</li>
        <li>Formas de pagamento: Pix, dinheiro ou cartão de crédito ou débito, na entrega (levamos a maquineta) ou na retirada. O pagamento é feito na entrega ou na retirada, na forma escolhida, salvo combinação diferente pelo WhatsApp.</li>
        <li>Se pagar em dinheiro e precisar de troco, informe o valor da nota, que deve ser igual ou maior que o total.</li>
      </ul>

      <h2>5. Alterações e cancelamento</h2>
      <p>
        Para alterar ou cancelar, chame no WhatsApp o quanto antes. Como preparamos os pedidos na hora, depois que o
        preparo começa pode não ser possível cancelar. Seus direitos de consumidor, previstos no Código de Defesa do
        Consumidor, continuam valendo.
      </p>

      <h2>6. Alergias e restrições alimentares</h2>
      <p>
        Se você tem alergia ou restrição, escreva no campo de observações e confirme com a gente pelo WhatsApp antes de
        finalizar. Há itens com leite, como {adicionais.filter((a) => /queijo|mussarela|requeij/i.test(a.nome)).map((a) => a.nome.toLowerCase()).join(", ")}, e
        com ovo, como {adicionais.filter((a) => /ovo/i.test(a.nome)).map((a) => a.nome.toLowerCase()).join(" e ")}. O refogado especial da casa leva shoyu e
        margarina. Na cozinha pode haver contato cruzado entre ingredientes.
      </p>

      <h2>7. Imagens e informações</h2>
      <p>
        As fotos são ilustrativas e o produto pode variar um pouco. Se algum preço ou descrição estiver errado,
        corrigiremos e avisaremos você antes de seguir com o pedido.
      </p>

      <h2>8. Suas responsabilidades</h2>
      <ul>
        <li>Informar dados e endereço corretos e estar disponível para receber o pedido.</li>
        <li>Não usar o site para fraude, pedidos falsos ou tentativas de acesso indevido.</li>
      </ul>

      <h2>9. Propriedade intelectual</h2>
      <p>
        A marca, o logotipo, os textos e as imagens do site pertencem à {empresa.nome}. Só podem ser usados com a nossa
        autorização.
      </p>

      <h2>10. Disponibilidade e responsabilidade</h2>
      <p>
        O site pode ficar indisponível por manutenção ou por falhas fora do nosso controle, como internet, WhatsApp ou
        o provedor de hospedagem. Isso não exclui a responsabilidade que a lei nos atribui.
      </p>

      <h2>11. Privacidade</h2>
      <p>
        O uso dos seus dados está descrito na <Link to="/privacidade">Política de Privacidade</Link>.
      </p>

      <h2>12. Mudanças, lei aplicável e foro</h2>
      <p>
        Podemos atualizar estes termos, e a data no topo mostra a última revisão. Valem as leis brasileiras, com foro na
        comarca de Maceió/AL, ressalvado o direito do consumidor de propor ação no foro do seu domicílio. Dúvidas: {zap}.
      </p>
    </Legal>
  );
}
