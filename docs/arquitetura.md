# Arquitetura do Sistema

## 1. Visão geral

O **WebGIS Geografia Agrária** é uma aplicação web destinada à consulta, visualização e organização de informações geográficas relacionadas ao espaço agrário e ao cadastro de produtores rurais da reforma agrária.

O sistema integra uma aplicação cartográfica interativa, um servidor backend, um banco de dados espacial PostgreSQL/PostGIS e uma aplicação independente de coleta de informações de produtores rurais.

A arquitetura atual é composta por dois fluxos principais:

1. **Fluxo de consulta espacial**, responsável pelo funcionamento do WebGIS e pela disponibilização de dados geográficos armazenados no PostgreSQL/PostGIS.
2. **Fluxo de coleta de dados**, responsável pelo questionário destinado aos produtores rurais, com armazenamento das respostas em Google Sheets por meio do Google Apps Script.

Essa separação permite que o WebGIS seja utilizado como ambiente de consulta e visualização espacial, enquanto o formulário funciona como aplicação específica para aquisição de informações em campo.

---

## 2. Objetivo da arquitetura

A arquitetura foi estruturada para separar as principais responsabilidades do sistema:

* **Frontend:** apresentação cartográfica e interação com o usuário;
* **Backend:** processamento das requisições e comunicação com o banco espacial;
* **PostgreSQL/PostGIS:** armazenamento e consulta dos dados geográficos;
* **Formulário:** coleta de informações dos produtores rurais;
* **Google Apps Script e Google Sheets:** recebimento e armazenamento das respostas do questionário.

Essa organização permite que os componentes sejam desenvolvidos e mantidos de forma relativamente independente.

---

## 3. Arquitetura geral

A arquitetura atual pode ser representada da seguinte forma:

```text
                         WEBGIS GEOGRAFIA AGRÁRIA
                                  │
                  ┌───────────────┴────────────────┐
                  │                                │
                  ▼                                ▼
          APLICAÇÃO WEBGIS                 FORMULÁRIO DE COLETA
                  │                                │
                  │                                │
          Vite + OpenLayers                 HTML + Leaflet
                  │                                │
                  ▼                                ▼
           API Express                    Google Apps Script
                  │                                │
                  ▼                                ▼
          PostgreSQL/PostGIS                  Google Sheets
                  │
        ┌─────────┼───────────────┐
        │         │               │
        ▼         ▼               ▼
   Produtores  Assentamentos  Unidades
                            Hidrográficas
```

O WebGIS principal utiliza **OpenLayers** para representação e interação com os dados geográficos. O formulário utiliza **Leaflet** para disponibilizar um mapa destinado à obtenção da localização da propriedade.

---

## 4. Frontend WebGIS

O frontend corresponde à interface cartográfica utilizada para consulta e exploração das informações geográficas.

A aplicação utiliza:

* HTML;
* CSS;
* JavaScript;
* Vite;
* OpenLayers;
* OpenStreetMap.

O arquivo principal da aplicação é:

```text
src/js/main.js
```

O `main.js` é responsável pela inicialização do mapa e pela implementação das principais funcionalidades cartográficas.

### 4.1 Mapa base

O mapa utiliza o **OpenStreetMap** como camada cartográfica base.

A biblioteca OpenLayers é responsável pelo gerenciamento do mapa, da visualização, das camadas vetoriais, dos estilos e das interações.

### 4.2 Camada de produtores

Os produtores rurais são carregados por meio da API:

```text
GET /api/produtores/geojson
```

O backend consulta os registros armazenados no PostGIS e os disponibiliza como uma `FeatureCollection` GeoJSON.

No frontend, os dados são convertidos de:

```text
EPSG:4326
```

para:

```text
EPSG:3857
```

para utilização no mapa OpenLayers.

Os produtores são representados por pontos e possuem controle individual de visibilidade.

### 4.3 Informações dos produtores

Ao selecionar um produtor no mapa, o WebGIS apresenta um popup com informações associadas ao registro, incluindo:

* nome;
* tipo de produção;
* núcleo rural ou assentamento;
* cultura ou criação;
* área;
* comercialização;
* programas governamentais;
* cooperativa ou associação;
* dificuldades;
* telefone;
* precisão GPS;
* data de envio;
* coordenadas.

### 4.4 Assentamentos

O WebGIS disponibiliza assentamentos como camadas vetoriais individuais.

Atualmente são configurados:

* Assentamento 1;
* Assentamento 2;
* Assentamento 3.

As geometrias são consultadas individualmente por meio da API:

```text
GET /api/assentamentos/:assentamento
```

O backend realiza a transformação das geometrias originais para EPSG:4326 antes de gerar o GeoJSON.

### 4.5 Unidades hidrográficas

As unidades hidrográficas são disponibilizadas pela API:

```text
GET /api/camadas/unidades-hidrograficas
```

O usuário pode controlar individualmente a visibilidade das unidades por meio do menu do WebGIS.

As unidades também possuem rótulos, que são exibidos a partir de determinado nível de zoom.

O frontend utiliza o atributo `luh_nm` para identificação das unidades hidrográficas.

### 4.6 Interface e controles

O frontend também implementa:

* sidebar;
* submenus;
* controles individuais de camadas;
* popup de informações;
* barra de status;
* indicação do nível de zoom;
* indicação do sistema de referência;
* escala cartográfica;
* coordenadas do cursor.

---

## 5. Backend

O backend é implementado em **Node.js**, utilizando o framework **Express**.

O servidor está localizado em:

```text
backend/server.cjs
```

O backend é responsável por intermediar a comunicação entre o frontend e o banco PostgreSQL/PostGIS.

### 5.1 Tecnologias utilizadas

O backend utiliza:

* Node.js;
* Express;
* `pg`;
* CORS;
* dotenv;
* PostgreSQL;
* PostGIS.

A conexão com o banco utiliza variáveis de ambiente armazenadas no arquivo `.env`.

### 5.2 Porta do servidor

O servidor Express é configurado para operar na porta:

```text
3001
```

Durante o desenvolvimento, o frontend Vite utiliza a porta:

```text
5173
```

O Vite possui uma configuração de proxy que encaminha as requisições iniciadas em `/api` para:

```text
http://localhost:3001
```

Dessa forma, o frontend não realiza diretamente a conexão com o PostgreSQL/PostGIS.

---

## 6. API

A API disponibilizada pelo backend possui atualmente as seguintes rotas principais:

| Método | Endpoint                              | Finalidade                                |
| ------ | ------------------------------------- | ----------------------------------------- |
| GET    | `/`                                   | Verificação do funcionamento da API       |
| POST   | `/api/produtores`                     | Recebimento e armazenamento de produtores |
| GET    | `/api/produtores`                     | Consulta dos produtores                   |
| GET    | `/api/produtores/geojson`             | Consulta dos produtores em GeoJSON        |
| GET    | `/api/assentamentos/:assentamento`    | Consulta de assentamento específico       |
| GET    | `/api/camadas/unidades-hidrograficas` | Consulta das unidades hidrográficas       |

A API utiliza consultas SQL para acessar o banco espacial e funções do PostGIS para conversão das geometrias em GeoJSON.

---

## 7. Banco de dados espacial

O sistema utiliza **PostgreSQL com a extensão PostGIS** para armazenamento e processamento de dados espaciais.

Os principais conjuntos de dados atualmente utilizados pelo backend estão organizados nos seguintes schemas:

```text
cadastro_produtores
└── produtores

assentamentos_bartolomeu
├── assentamento_1
├── assentamento_2
└── assentamento_3

unidades_hidrograficas_df
└── unidades_hidrograficas
```

### 7.1 Produtores

A tabela:

```text
cadastro_produtores.produtores
```

armazena os registros dos produtores rurais.

Entre os atributos utilizados pelo sistema estão:

* `id`;
* `nome`;
* `tipo_producao`;
* `nrural_assentamento`;
* `cultura_criacao`;
* `area_ha`;
* `comercializacao`;
* `programas_gov`;
* `coop_assoc`;
* `dificuldades`;
* `telefone`;
* `precisao_gps`;
* `geom`;
* `data_envio`.

A geometria dos produtores é construída a partir das coordenadas de longitude e latitude e armazenada com SRID EPSG:4326.

### 7.2 Assentamentos

As tabelas dos assentamentos utilizam geometria do tipo `MULTIPOLYGON` e possuem geometria originalmente armazenada em EPSG:31983.

O backend realiza a transformação para EPSG:4326 antes de gerar o GeoJSON disponibilizado ao frontend.

### 7.3 Unidades hidrográficas

As unidades hidrográficas são consultadas a partir de:

```text
unidades_hidrograficas_df.unidades_hidrograficas
```

As geometrias são transformadas para EPSG:4326 antes de serem disponibilizadas como GeoJSON.

---

## 8. Fluxo de dados do WebGIS

O fluxo de consulta cartográfica ocorre da seguinte maneira:

```text
Usuário
   │
   ▼
Interface WebGIS
   │
   ▼
OpenLayers
   │
   ▼
Requisição HTTP /api/*
   │
   ▼
Vite Proxy
   │
   ▼
Express
   │
   ▼
PostgreSQL + PostGIS
   │
   ▼
Consulta espacial
   │
   ▼
GeoJSON
   │
   ▼
Express
   │
   ▼
Frontend
   │
   ▼
Visualização no mapa
```

O navegador não acessa diretamente o banco de dados. As consultas são intermediadas pelo backend.

---

## 9. Fluxo de cadastro dos produtores

Quando um produtor é cadastrado pelo endpoint correspondente, o backend:

1. recebe os dados em JSON;
2. verifica se existem dados no corpo da requisição;
3. converte latitude e longitude para valores numéricos;
4. valida os limites das coordenadas;
5. processa a área da propriedade;
6. processa a precisão GPS;
7. organiza as dificuldades informadas;
8. processa informações sobre cooperativas e associações;
9. processa informações sobre programas governamentais;
10. organiza o tipo de produção;
11. constrói a geometria espacial;
12. insere o registro no PostgreSQL/PostGIS;
13. retorna o identificador do registro e a data de envio.

A geometria é construída a partir de longitude e latitude por meio das funções espaciais do PostGIS.

---

## 10. Formulário de coleta

O formulário de produtores rurais é uma aplicação independente localizada em:

```text
formulario/
├── formulario.js
├── index.html
└── style.css
```

A aplicação possui etapas de preenchimento e recursos específicos para coleta de localização.

### 10.1 Mapa do formulário

O formulário utiliza **Leaflet** e OpenStreetMap.

O mapa permite:

* visualizar a localização;
* obter a posição atual do dispositivo;
* posicionar um marcador;
* registrar latitude;
* registrar longitude;
* registrar a precisão obtida pelo dispositivo.

### 10.2 Geolocalização

A localização é obtida por meio da **Geolocation API** do navegador.

O formulário registra:

```text
latitude
longitude
precisão GPS
```

A solicitação de localização utiliza alta precisão, limite de tempo e controle da idade máxima da posição.

### 10.3 Armazenamento das respostas

Na versão atual, o formulário envia as respostas diretamente para um endpoint publicado do **Google Apps Script**.

O fluxo é:

```text
Formulário
    │
    ▼
FormData
    │
    ▼
Objeto JavaScript
    │
    ▼
  JSON
    │
    ▼
Google Apps Script
    │
    ▼
Google Sheets
```

Portanto, o formulário possui atualmente um fluxo de armazenamento independente do backend Express/PostGIS.

---

## 11. Tecnologias utilizadas

| Componente                    | Tecnologia                         |
| ----------------------------- | ---------------------------------- |
| Linguagem principal           | JavaScript                         |
| Frontend                      | HTML, CSS e JavaScript             |
| Build/dev server              | Vite                               |
| WebGIS                        | OpenLayers                         |
| Mapa do formulário            | Leaflet                            |
| Mapa base                     | OpenStreetMap                      |
| Backend                       | Node.js + Express                  |
| Banco de dados                | PostgreSQL                         |
| Extensão espacial             | PostGIS                            |
| Conexão com PostgreSQL        | `pg`                               |
| Variáveis de ambiente         | dotenv                             |
| Comunicação HTTP              | Fetch API                          |
| Formulário                    | HTML + JavaScript                  |
| Armazenamento do questionário | Google Apps Script + Google Sheets |

---

## 12. Estrutura do projeto

A estrutura de desenvolvimento atual do projeto é:

```text
WEBGIS_GEOGRAFIA_AGRARIA/
│
├── backend/
│   ├── dados/
│   │   └── produtores.json
│   ├── .env
│   └── server.cjs
│
├── formulario/
│   ├── formulario.js
│   ├── index.html
│   └── style.css
│
├── images/
│   ├── questionario.png
│   ├── webgis_funcoes.png
│   └── webgis_principal.png
│
├── public/
│
├── src/
│   ├── assets/
│   ├── css/
│   └── js/
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

A pasta `node_modules/`, é utilizada localmente para as dependências do projeto.

---

## 13. Configuração do ambiente de desenvolvimento

O frontend utiliza Vite.

Os principais comandos disponíveis são:

```bash
npm run dev
```

para iniciar o servidor de desenvolvimento;

```bash
npm run build
```

para gerar a versão de produção;

```bash
npm run preview
```

para visualizar a versão produzida pelo processo de build.

O servidor Vite é configurado na porta `5173`, enquanto o backend Express utiliza a porta `3001`.

A configuração de proxy permite que as requisições iniciadas pelo frontend em `/api` sejam encaminhadas ao backend Express.

---

## 14. Variáveis de ambiente e segurança

As credenciais utilizadas para conexão com o PostgreSQL são carregadas pelo backend por meio do pacote `dotenv`.

As informações de conexão são mantidas em:

```text
backend/.env
```
---

## 15. Comunicação entre os componentes

A comunicação do WebGIS é baseada em requisições HTTP.

O frontend realiza chamadas para endpoints da API utilizando `fetch()`.

Exemplo:

```text
Frontend
   │
   │ GET /api/produtores/geojson
   ▼
Express
   │
   │ SQL
   ▼
PostGIS
   │
   │ GeoJSON
   ▼
Express
   │
   ▼
Frontend
```

O backend funciona como camada intermediária entre a interface cartográfica e o banco espacial.

Essa separação evita que as credenciais e os parâmetros de conexão do PostgreSQL sejam expostos ao navegador.

---

## 16. Sistemas de referência espacial

O sistema utiliza diferentes sistemas de referência de acordo com a origem e finalidade dos dados.

### Produtores

Os pontos dos produtores são armazenados em:

```text
EPSG:4326
```

### Assentamentos

As geometrias dos assentamentos são armazenadas originalmente em:

```text
EPSG:31983
```

e transformadas para:

```text
EPSG:4326
```

antes da geração do GeoJSON.

### Unidades hidrográficas

As geometrias das unidades hidrográficas também são transformadas para:

```text
EPSG:4326
```

antes de serem disponibilizadas pelo backend.

No frontend, as geometrias GeoJSON são convertidas para:

```text
EPSG:3857
```

para utilização no OpenLayers.

---

## 17. Publicação

O repositório GitHub funciona como espaço de organização, versionamento e documentação do projeto.

A estrutura de publicação prevista é:

```text
webgis-geografia-agraria/
│
├── README.md
├── frontend/
├── backend/
├── formulario/
└── docs/
```

O código-fonte, a documentação e os recursos necessários para compreensão do projeto estão organizados no repositório.

---

## 18. Manutenção e evolução

A arquitetura foi organizada de forma a permitir a evolução independente dos componentes.

Novas funcionalidades cartográficas podem ser incorporadas ao frontend, enquanto novas consultas e operações espaciais podem ser implementadas no backend e no banco PostGIS.

Da mesma forma, o formulário pode receber novas etapas, campos ou funcionalidades de geolocalização sem exigir alterações imediatas na interface principal do WebGIS.

A arquitetura também permite que novas camadas geográficas sejam incorporadas progressivamente ao banco espacial e disponibilizadas por novos endpoints da API.

O sistema constitui, portanto, uma base para evolução contínua do WebGIS de Geografia Agrária, mantendo a separação entre interface, processamento de requisições, armazenamento espacial e coleta de dados.
