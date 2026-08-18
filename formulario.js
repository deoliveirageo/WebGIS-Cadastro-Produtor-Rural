/* ==========================================================
   QUESTIONÁRIO DE PRODUTORES RURAIS
   MÓDULO 5 — LOCALIZAÇÃO
   ========================================================== */


/* ==========================================================
   1. ELEMENTOS DO FORMULÁRIO
   ========================================================== */

const formulario =
    document.getElementById("questionario");

const etapas =
    document.querySelectorAll(".etapa");

const indicadorEtapa =
    document.getElementById("indicador-etapa");

const botoesProximo =
    document.querySelectorAll(".btn-proximo");

const botoesVoltar =
    document.querySelectorAll(".btn-voltar");


/* ==========================================================
   2. CONTROLE DA NAVEGAÇÃO
   ========================================================== */

let etapaAtual = 0;


/* ==========================================================
   3. MOSTRAR ETAPA
   ========================================================== */

function mostrarEtapa(numero) {

    etapas.forEach(function(etapa) {

        etapa.style.display = "none";

    });


    etapas[numero].style.display = "block";


    indicadorEtapa.textContent =
        `Etapa ${numero + 1} de ${etapas.length}`;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    /*
       Quando a etapa do mapa for aberta,
       precisamos atualizar o tamanho do mapa.
    */

    if (
        typeof mapa !== "undefined" &&
        numero === 1
    ) {

        setTimeout(function() {

            mapa.invalidateSize(true);

        }, 500);

    }

}


/* ==========================================================
   4. BOTÕES PRÓXIMO
   ========================================================== */

botoesProximo.forEach(function(botao) {

    botao.addEventListener(
        "click",
        function() {

            if (
                etapaAtual <
                etapas.length - 1
            ) {

                etapaAtual++;

                mostrarEtapa(etapaAtual);

            }

        }
    );

});


/* ==========================================================
   5. BOTÕES VOLTAR
   ========================================================== */

botoesVoltar.forEach(function(botao) {

    botao.addEventListener(
        "click",
        function() {

            if (etapaAtual > 0) {

                etapaAtual--;

                mostrarEtapa(etapaAtual);

            }

        }
    );

});


/* ==========================================================
   6. PERGUNTA — PROGRAMAS INSTITUCIONAIS
   ========================================================== */

const programaSim =
    document.getElementById("programa_sim");

const programaNao =
    document.getElementById("programa_nao");

const campoPrograma =
    document.getElementById("campo_programa");


function verificarPrograma() {

    if (programaSim.checked) {

        campoPrograma.style.display =
            "block";

    } else {

        campoPrograma.style.display =
            "none";

    }

}


programaSim.addEventListener(
    "change",
    verificarPrograma
);

programaNao.addEventListener(
    "change",
    verificarPrograma
);


/* ==========================================================
   7. PERGUNTA — COOPERATIVA
   ========================================================== */

const cooperativaSim =
    document.getElementById(
        "cooperativa_sim"
    );

const cooperativaNao =
    document.getElementById(
        "cooperativa_nao"
    );

const campoCooperativa =
    document.getElementById(
        "campo_cooperativa"
    );


function verificarCooperativa() {

    if (cooperativaSim.checked) {

        campoCooperativa.style.display =
            "block";

    } else {

        campoCooperativa.style.display =
            "none";

    }

}


cooperativaSim.addEventListener(
    "change",
    verificarCooperativa
);

cooperativaNao.addEventListener(
    "change",
    verificarCooperativa
);


/* ==========================================================
   8. TIPO DE PRODUÇÃO — OUTRO
   ========================================================== */

const tipoProducao =
    document.getElementById(
        "tipo_producao"
    );

const campoTipoOutro =
    document.getElementById(
        "campo_tipo_outro"
    );


function verificarTipoProducao() {

    if (
        tipoProducao.value ===
        "outro"
    ) {

        campoTipoOutro.style.display =
            "block";

    } else {

        campoTipoOutro.style.display =
            "none";

    }

}


tipoProducao.addEventListener(
    "change",
    verificarTipoProducao
);


/* ==========================================================
   9. DIFICULDADE — OUTRO
   ========================================================== */

const dificuldadeOutro =
    document.getElementById(
        "dificuldade_outro"
    );

const campoDificuldadeOutro =
    document.getElementById(
        "campo_dificuldade_outro"
    );


function verificarDificuldadeOutro() {

    if (
        dificuldadeOutro.checked
    ) {

        campoDificuldadeOutro.style.display =
            "block";

    } else {

        campoDificuldadeOutro.style.display =
            "none";

    }

}


dificuldadeOutro.addEventListener(
    "change",
    verificarDificuldadeOutro
);


/* ==========================================================
   10. MAPA LEAFLET
   ========================================================== */

const mapa =
    L.map("mapa").setView(
        [-15.7801, -47.9292],
        10
    );


/* ==========================================================
   11. MAPA BASE — OPENSTREETMAP
   ========================================================== */

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,

        attribution:
            '&copy; OpenStreetMap contributors'
    }
).addTo(mapa);


/*
   Atualiza o tamanho do mapa após sua criação.
   Isso evita problemas de posicionamento dos tiles
   quando o mapa está dentro de uma etapa do formulário.
*/

setTimeout(function() {

    mapa.invalidateSize(true);

}, 500);


/* ==========================================================
   12. MARCADOR
   ========================================================== */

let marcador = null;


/* ==========================================================
   13. ELEMENTOS DA LOCALIZAÇÃO
   ========================================================== */

const botaoLocalizacao =
    document.getElementById(
        "btn-localizacao"
    );

const statusLocalizacao =
    document.getElementById(
        "status-localizacao"
    );

const campoLatitude =
    document.getElementById(
        "latitude"
    );

const campoLongitude =
    document.getElementById(
        "longitude"
    );

const campoPrecisao =
    document.getElementById(
        "precisao"
    );


/* ==========================================================
   14. OBTER LOCALIZAÇÃO
   ========================================================== */

botaoLocalizacao.addEventListener(
    "click",
    function() {

        /*
           Verifica se o navegador
           possui Geolocation API.
        */

        if (
            !navigator.geolocation
        ) {

            statusLocalizacao.textContent =
                "Seu navegador não oferece suporte à localização.";

            return;

        }


        /*
           Mensagem enquanto o GPS
           está sendo obtido.
        */

        statusLocalizacao.textContent =
            "Obtendo sua localização...";


        botaoLocalizacao.disabled =
            true;


        /*
           Solicita a posição atual.
        */

        navigator.geolocation.getCurrentPosition(

            function(posicao) {

                const latitude =
                    posicao.coords.latitude;

                const longitude =
                    posicao.coords.longitude;

                const precisao =
                    posicao.coords.accuracy;


                /* ------------------------------------------
                   PREENCHER CAMPOS
                   ------------------------------------------ */

                campoLatitude.value =
                    latitude.toFixed(6);

                campoLongitude.value =
                    longitude.toFixed(6);

                campoPrecisao.value =
                    `${Math.round(precisao)} metros`;


                /* ------------------------------------------
                   ATUALIZAR MAPA
                   ------------------------------------------ */

                mapa.setView(
                    [latitude, longitude],
                    17
                );


                /* ------------------------------------------
                   REMOVER MARCADOR ANTERIOR
                   ------------------------------------------ */

                if (marcador !== null) {

                    mapa.removeLayer(
                        marcador
                    );

                }


                /* ------------------------------------------
                   CRIAR NOVO MARCADOR
                   ------------------------------------------ */

                marcador =
                    L.marker(
                        [
                            latitude,
                            longitude
                        ]
                    ).addTo(mapa);


                marcador.bindPopup(
                    "<strong>Localização da propriedade</strong>"
                ).openPopup();


                /* ------------------------------------------
                   STATUS
                   ------------------------------------------ */

                statusLocalizacao.textContent =
                    "Localização obtida com sucesso.";


                statusLocalizacao.style.backgroundColor =
                    "#e4f0e7";


                statusLocalizacao.style.color =
                    "#245536";


                botaoLocalizacao.disabled =
                    false;


            },


            function(erro) {

                botaoLocalizacao.disabled =
                    false;


                /*
                   Tratamento dos principais
                   erros da Geolocation API.
                */

                if (
                    erro.code ===
                    erro.PERMISSION_DENIED
                ) {

                    statusLocalizacao.textContent =
                        "Permissão de localização negada.";

                }

                else if (
                    erro.code ===
                    erro.POSITION_UNAVAILABLE
                ) {

                    statusLocalizacao.textContent =
                        "Não foi possível determinar sua localização.";

                }

                else if (
                    erro.code ===
                    erro.TIMEOUT
                ) {

                    statusLocalizacao.textContent =
                        "Tempo limite para obter a localização.";

                }

                else {

                    statusLocalizacao.textContent =
                        "Não foi possível obter a localização.";

                }

            },

            {
                enableHighAccuracy: true,

                timeout: 15000,

                maximumAge: 0
            }

        );

    }
);


/* ==========================================================
   15. ENVIO DO FORMULÁRIO PARA O GOOGLE SHEETS
   ========================================================== */

formulario.addEventListener(
    "submit",
    async function(event) {

        /*
           Impede o navegador de recarregar
           a página.
        */

        event.preventDefault();


        /*
           Cria um objeto com todos os dados
           preenchidos no formulário.
        */

        const dadosFormulario =
            new FormData(formulario);


        /*
           Converte os dados para um objeto JavaScript.
        */

        const dados = {};


        dadosFormulario.forEach(
            function(valor, chave) {

                /*
                   Checkbox de dificuldades pode
                   possuir vários valores.
                */

                if (chave === "dificuldades") {

                    if (!dados[chave]) {

                        dados[chave] = [];

                    }

                    dados[chave].push(valor);

                }

                else {

                    dados[chave] = valor;

                }

            }
        );


        /*
           Converte a precisão capturada pelo
           campo "precisao" para o campo
           "precisao_gps" usado na planilha.

           Exemplo:
           "10 metros" → 10
        */

        if (dados.precisao) {

            dados.precisao_gps =
                parseFloat(
                    dados.precisao
                );

            delete dados.precisao;

        }


        /*
           Mostra no console os dados
           antes do envio.
        */

        console.log(
            "Dados que serão enviados:"
        );

        console.log(dados);


        try {

            /*
               Envia os dados para o Google Apps Script.

               O Google Apps Script recebe o JSON
               e grava os dados no Google Sheets.
            */

            const resposta =
                await fetch(
                    "https://script.google.com/macros/s/AKfycbzG7nwzozHPY32Ba0jpNyB614erSq-ITa8fL8bxZVMifgD5ak3hjvWN6DhwkZmtI42kuA/exec",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "text/plain;charset=utf-8"
                        },

                        body:
                            JSON.stringify(dados)
                    }
                );


            /*
               Converte a resposta do
               Google Apps Script para JSON.
            */

            const resultado =
                await resposta.json();


            console.log(
                "Resposta do Google Sheets:"
            );

            console.log(resultado);


            /*
               Verifica se o Google Apps Script
               recebeu e armazenou os dados.
            */

            if (resultado.sucesso) {

                alert(
                    "Questionário enviado com sucesso!"
                );

            }

            else {

                alert(
                    "O questionário não pôde ser armazenado."
                );

            }

        }

        catch (erro) {

            console.error(
                "Erro ao enviar questionário:",
                erro
            );


            alert(
                "Não foi possível enviar o questionário. " +
                "Verifique sua conexão e tente novamente."
            );

        }

    }
);


/* ==========================================================
   16. ESTADO INICIAL DOS CAMPOS CONDICIONAIS
   ========================================================== */

campoPrograma.style.display =
    "none";

campoCooperativa.style.display =
    "none";

campoTipoOutro.style.display =
    "none";

campoDificuldadeOutro.style.display =
    "none";


/* ==========================================================
   17. INICIALIZAÇÃO
   ========================================================== */

mostrarEtapa(etapaAtual);
