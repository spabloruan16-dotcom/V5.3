const sessao = JSON.parse(
    localStorage.getItem("modaCenterSession") || "null"
);

const clientId = sessao?.id;


async function buscarPontos(cartaoId) {

    if (!clientId) {
        return 0;
    }

    try {

        const resposta = await fetch(
            `/api/loyalty-points?cartaoId=${encodeURIComponent(cartaoId)}&clientId=${encodeURIComponent(clientId)}`
        );

        if (!resposta.ok) {
            return 0;
        }

        const dados = await resposta.json();

        return Number(dados.pontos) || 0;

    } catch (erro) {

        console.error(
            "Erro ao buscar pontos:",
            erro
        );

        return 0;
    }
}


async function carregarCartoes() {

    const lista = document.getElementById("listaCartoes");

    try {

        const resposta = await fetch("/api/loyalty-cards");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar cartões");
        }

        const dados = await resposta.json();

        const cartoes = Array.isArray(dados.cartoes)
            ? dados.cartoes
            : [];

        if (cartoes.length === 0) {

            lista.innerHTML = `
                <p class="mensagem-vazia">
                    Nenhum Cartão de Fidelidade disponível.
                </p>
            `;

            return;
        }

        const cartoesHTML = await Promise.all(

            cartoes.map(async cartao => {

                const pontosAtuais =
                    await buscarPontos(cartao.id);

                const meta =
                    Number(cartao.metaPontos);

                let validade =
                    "Sem data de validade";

                if (cartao.validade) {

                    const partes =
                        cartao.validade.split("-");

                    if (partes.length === 3) {

                        validade =
                            `${partes[2]}/${partes[1]}/${partes[0]}`;
                    }
                }

                return `

                    <article class="cartao-fidelidade">

                        <div class="cartao-topo">

                            <span class="cartao-label">
                                CARTÃO FIDELIDADE
                            </span>

                            <span class="cartao-icon">
                                🎁
                            </span>

                        </div>

                        <h2>${cartao.nome}</h2>

                        <div class="contador-pontos">
                            ${pontosAtuais} / ${meta} pontos
                        </div>

                        <div class="cartao-info">

                            <div>
                                <span>RECOMPENSA</span>
                                <strong>
                                    ${cartao.recompensa}
                                </strong>
                            </div>

                            <div>
                                <span>DESCONTO</span>
                                <strong>
                                    R$ ${Number(cartao.descontoValor || 0).toFixed(2).replace(".", ",")}
                                </strong>
                            </div>

                            <div>
                                <span>VALIDADE</span>
                                <strong>
                                    ${validade}
                                </strong>
                            </div>

                        </div>

                    </article>

                `;

            })

        );

        lista.innerHTML =
            cartoesHTML.join("");

    } catch (erro) {

        console.error(
            "Erro ao carregar cartões:",
            erro
        );

        lista.innerHTML = `
            <p class="mensagem-erro">
                Não foi possível carregar os cartões.
            </p>
        `;
    }
}


carregarCartoes();