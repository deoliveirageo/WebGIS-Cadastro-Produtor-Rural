# WebGIS Geografia Agrária

WebGIS desenvolvido como parte de um projeto de estágio, destinado à integração, visualização e organização de dados geográficos relacionados ao espaço agrário e à coleta de informações de produtores rurais, que funciona como uma base cadastral de produtores ruais com geolocalização. 

O projeto integra uma aplicação web de visualização cartográfica, uma API de backend, um banco de dados espacial PostgreSQL/PostGIS e uma aplicação independente de coleta de informações de produtores rurais.

> **Status:** protótipo experimental para portfólio.
> O WebGIS não está disponibilizado para consulta pública nesta etapa do projeto.

---

## Sobre o projeto

O **WebGIS Geografia Agrária** foi desenvolvido como uma aplicação experimental voltada à organização, consulta e visualização espacial de informações relacionadas ao espaço agrário e ao cadastro de produtores rurais da reforma agrária. 

A aplicação permite integrar diferentes conjuntos de dados geográficos e informações cadastrais em um ambiente cartográfico interativo, possibilitando a consulta de atributos e a representação espacial dos dados.

Entre as funcionalidades implementadas estão:

* visualização cartográfica interativa;
* utilização do OpenStreetMap como mapa-base;
* visualização de produtores rurais;
* controle individual da visibilidade dos produtores;
* consulta de informações cadastrais dos produtores;
* visualização de assentamentos;
* controle individual das camadas de assentamentos;
* visualização de unidades hidrográficas;
* controle individual das unidades hidrográficas;
* identificação e exibição de rótulos das unidades hidrográficas;
* consulta de atributos espaciais;
* apresentação de informações em popups;
* barra de status com zoom, escala, coordenadas e sistema de referência;
* integração com PostgreSQL/PostGIS;
* disponibilização de dados espaciais por meio de uma API;
* formulário independente para coleta de informações de produtores rurais;
* obtenção de localização por GPS no formulário;
* armazenamento das respostas do formulário em Google Sheets por meio do Google Apps Script.

---

## Visualização do projeto

### Interface principal

![Interface principal do WebGIS](images/webgis_principal.png)

### Ferramentas e funcionalidades

![Ferramentas e funcionalidades do WebGIS](images/webgis_funcoes.png)

### Formulário de produtores rurais

![Questionário de produtores rurais](images/questionario.png)

---

## Arquitetura do sistema

A arquitetura atual é composta por dois fluxos principais:

1. **WebGIS:** consulta e visualização de dados espaciais armazenados no PostgreSQL/PostGIS por meio de uma API.
2. **Formulário:** coleta de informações de produtores rurais e armazenamento das respostas em Google Sheets por meio do Google Apps Script.

```text
                         WEBGIS GEOGRAFIA AGRÁRIA
                                  │
                  ┌───────────────┴────────────────┐
                  │                                │
                  ▼                                ▼
          APLICAÇÃO WEBGIS                 FORMULÁRIO DE COLETA
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

O frontend do WebGIS utiliza **OpenLayers**, enquanto o formulário utiliza **Leaflet** para a interface cartográfica de localização.

A comunicação entre o WebGIS e o banco de dados ocorre por meio do backend. O navegador não realiza conexão direta com o PostgreSQL/PostGIS.

---

## Frontend WebGIS

A interface cartográfica utiliza:

* HTML5;
* CSS3;
* JavaScript;
* Vite;
* OpenLayers;
* OpenStreetMap.

O frontend é responsável pela representação cartográfica, interação com as camadas e apresentação das informações ao usuário.

Entre suas funções estão:

* inicialização do mapa;
* carregamento do mapa-base;
* carregamento dos produtores por GeoJSON;
* carregamento dos assentamentos;
* carregamento das unidades hidrográficas;
* controle individual das camadas;
* rótulos das unidades hidrográficas;
* identificação de elementos;
* popups informativos;
* sidebar;
* barra de status;
* controle de zoom;
* escala cartográfica;
* coordenadas do cursor.

---

## Backend e API

O backend foi desenvolvido em **Node.js** utilizando **Express** e funciona como camada intermediária entre o frontend e o banco de dados espacial.

Entre as principais tecnologias utilizadas estão:

* Node.js;
* Express;
* `pg`;
* CORS;
* dotenv;
* PostgreSQL;
* PostGIS.

A API disponibiliza atualmente endpoints para:

```text
GET  /
POST /api/produtores
GET  /api/produtores
GET  /api/produtores/geojson
GET  /api/assentamentos/:assentamento
GET  /api/camadas/unidades-hidrograficas
```

Os dados espaciais são disponibilizados ao frontend principalmente no formato **GeoJSON**.

---

## Banco de dados espacial

O projeto utiliza **PostgreSQL com a extensão PostGIS** para armazenamento e consulta dos principais dados espaciais.

A estrutura atualmente utilizada pelo backend contempla:

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

Os produtores são representados espacialmente como pontos. Os assentamentos e as unidades hidrográficas utilizam geometrias poligonais.

O PostGIS também é utilizado para operações de transformação de sistemas de referência e conversão das geometrias para GeoJSON.

**A nomenclatura real dos esquemas e tabelas utilizadas no banco de dados foram alterados nesta documentação por razões de privacidade**

**os dados de produtores, assentamentos e unidades hidrográficas utilizados neste projeto foram utilizados como estudo de caso atribuído em etágio supervisionado aplicado a pesquisa em Geografia Agrária**

---

## Formulário de produtores rurais

O projeto possui uma aplicação independente destinada à coleta de informações de produtores rurais.

O formulário utiliza:

* HTML;
* CSS;
* JavaScript;
* Leaflet;
* OpenStreetMap;
* Geolocation API;
* Google Apps Script;
* Google Sheets.

A aplicação permite obter a localização da propriedade por meio do dispositivo do usuário, registrando:

* latitude;
* longitude;
* precisão GPS.

O fluxo atual de armazenamento é:

```text
Produtor rural
      │
      ▼
Formulário Web
      │
      ▼
Geolocation API
      │
      ▼
Google Apps Script
      │
      ▼
Google Sheets
```

### Integração futura

A integração direta entre os dados coletados pelo formulário e o PostgreSQL/PostGIS constitui uma possibilidade de evolução do projeto.

Nesta versão, o armazenamento das respostas do questionário ocorre de forma independente no Google Sheets.

---

## Fluxo de dados do WebGIS

O fluxo de consulta espacial ocorre da seguinte maneira:

```text
PostgreSQL/PostGIS
        │
        ▼
     Backend
        │
        ▼
       API
        │
        ▼
     GeoJSON
        │
        ▼
    OpenLayers
        │
        ▼
     Usuário
```

O frontend solicita os dados por meio da API, o backend realiza as consultas no PostgreSQL/PostGIS e retorna os dados espaciais em formato adequado à visualização cartográfica.

---

## Tecnologias

| Área                        | Tecnologia            |
| --------------------------- | --------------------- |
| Linguagem                   | JavaScript            |
| Estrutura web               | HTML5 / CSS3          |
| Desenvolvimento frontend    | Vite                  |
| WebGIS                      | OpenLayers            |
| Mapa do formulário          | Leaflet               |
| Mapa-base                   | OpenStreetMap         |
| Backend                     | Node.js / Express     |
| API                         | HTTP / JSON / GeoJSON |
| Banco de dados              | PostgreSQL            |
| Banco espacial              | PostGIS               |
| Conexão com PostgreSQL      | `pg`                  |
| Variáveis de ambiente       | dotenv                |
| Geolocalização              | Geolocation API       |
| Coleta de dados             | Google Apps Script    |
| Armazenamento do formulário | Google Sheets         |
| Versionamento               | Git / GitHub          |

---

## Documentação técnica

A documentação detalhada do sistema está organizada na pasta [`docs/`](docs/).

| Documento                                     | Conteúdo                                                          |
| --------------------------------------------- | ----------------------------------------------------------------- |
| [`arquitetura.md`](docs/arquitetura.md)       | Arquitetura geral e funcionamento do sistema                      |
| [`banco-de-dados.md`](docs/banco-de-dados.md) | Estrutura do PostgreSQL/PostGIS e organização dos dados espaciais |
| [`api.md`](docs/api.md)                       | Endpoints, métodos HTTP e funcionamento da API                    |

---

## Estrutura do repositório

Nesta etapa, o repositório GitHub está organizado prioritariamente como **documentação e apresentação do projeto**:

```text
webgis-geografia-agraria/
│
├── README.md
│
├── formulario.js
├── index.html
├── style.css
│
├── images/
│   ├── webgis_principal.png
│   ├── webgis_funcoes.png
│   └── questionario.png
│
└── docs/
    ├── arquitetura.md
    ├── banco-de-dados.md
    └── api.md
```

O código-fonte completo do ambiente de desenvolvimento não é disponibilizado publicamente nesta etapa.

O projeto continua sendo desenvolvido e executado em ambiente local.

---

## Ambiente de desenvolvimento

A versão experimental do sistema utiliza um ambiente local composto por:

```text
Frontend
   │
   ▼
Vite
   │
   ▼
Backend / API
   │
   ▼
PostgreSQL + PostGIS
```

O formulário possui fluxo independente:

```text
Formulário
   │
   ▼
Google Apps Script
   │
   ▼
Google Sheets
```

As configurações de banco de dados e demais variáveis sensíveis são mantidas no ambiente local e não fazem parte da documentação pública do repositório.

---

## Status do projeto

**🚧 Protótipo experimental — em desenvolvimento**

O projeto encontra-se em desenvolvimento incremental e é utilizado atualmente como modelo experimental e objeto de portfólio.

A versão atual concentra-se na implementação e demonstração da arquitetura de um WebGIS aplicado à Geografia Agrária, incluindo:

* visualização cartográfica;
* integração com banco espacial;
* API para disponibilização de dados;
* consulta de produtores rurais;
* representação de assentamentos;
* representação de unidades hidrográficas;
* coleta remota de informações;
* geolocalização;
* documentação técnica.

Novas funcionalidades, camadas geográficas e integrações poderão ser incorporadas futuramente conforme a evolução do projeto.

O WebGIS **não está disponibilizado para consulta pública nesta etapa**.

---

## Licença

A licença do projeto será definida posteriormente.
