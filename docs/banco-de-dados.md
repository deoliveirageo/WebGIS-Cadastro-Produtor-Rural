# Banco de Dados Espacial

## 1. Visão geral

O WebGIS Geografia Agrária utiliza **PostgreSQL com a extensão espacial PostGIS** como sistema de gerenciamento e armazenamento dos principais dados geográficos utilizados pela aplicação.

O banco de dados é responsável pelo armazenamento dos registros de produtores rurais e pela disponibilização de dados espaciais referentes a assentamentos e unidades hidrográficas.

A comunicação entre o WebGIS e o banco ocorre por meio do backend desenvolvido em Node.js e Express. O frontend não realiza conexão direta com o PostgreSQL/PostGIS.

---

## 2. Arquitetura do banco de dados

A comunicação com o banco segue o fluxo:

```text
WebGIS
   │
   │ Requisição HTTP
   ▼
Backend Express
   │
   │ SQL
   ▼
PostgreSQL + PostGIS
   │
   ├── cadastro_produtores
   ├── assentamentos_bartolomeu
   └── unidades_hidrograficas_df
```

O backend utiliza o pacote `pg` para estabelecer a conexão com o PostgreSQL e executar as consultas SQL.

---

## 3. Schemas utilizados

O sistema utiliza três schemas principais para os dados espaciais:

```text
cadastro_produtores
assentamentos_bartolomeu
unidades_hidrograficas_df
```

A separação por schemas permite organizar conjuntos de dados com diferentes finalidades dentro do banco espacial.

---

## 4. Schema `cadastro_produtores`

O schema `cadastro_produtores` contém os dados referentes aos produtores rurais cadastrados no sistema.

A tabela utilizada pelo backend é:

```text
cadastro_produtores.produtores
```

### 4.1 Estrutura utilizada pelo sistema

Os principais campos utilizados pela aplicação são:

| Campo                 | Finalidade                               |
| --------------------- | ---------------------------------------- |
| `id`                  | Identificador do produtor                |
| `nome`                | Nome do produtor                         |
| `tipo_producao`       | Tipo de produção                         |
| `nrural_assentamento` | Núcleo rural ou assentamento             |
| `cultura_criacao`     | Cultura ou criação                       |
| `area_ha`             | Área da propriedade em hectares          |
| `comercializacao`     | Forma de comercialização                 |
| `programas_gov`       | Participação em programas governamentais |
| `coop_assoc`          | Cooperativa ou associação                |
| `dificuldades`        | Dificuldades informadas                  |
| `telefone`            | Telefone informado no cadastro           |
| `precisao_gps`        | Precisão da localização GPS              |
| `geom`                | Geometria espacial do produtor           |
| `data_envio`          | Data e hora do cadastro                  |

Os campos acima correspondem aos atributos utilizados pelo backend nas operações de inserção e consulta dos produtores.

---

## 5. Geometria dos produtores

Os produtores são representados espacialmente por pontos.

A geometria é construída a partir das coordenadas de longitude e latitude recebidas pelo backend.

O processo utilizado é:

```text
Longitude
    +
Latitude
    │
    ▼
ST_MakePoint()
    │
    ▼
ST_SetSRID(..., 4326)
    │
    ▼
Geometria PostGIS
```

A geometria é armazenada com:

```text
SRID: EPSG:4326
```

O backend utiliza longitude como primeiro parâmetro e latitude como segundo parâmetro na construção do ponto.

---

## 6. Inserção dos produtores

O cadastro de produtores é realizado pelo endpoint:

```text
POST /api/produtores
```

O backend recebe os dados em JSON e realiza procedimentos de validação e preparação antes da inserção no banco.

Entre os procedimentos realizados estão:

* verificação da existência dos dados;
* conversão de latitude e longitude para valores numéricos;
* validação dos limites das coordenadas;
* conversão da área para valor numérico;
* processamento da precisão GPS;
* organização das dificuldades;
* processamento de informações sobre cooperativas ou associações;
* processamento de programas governamentais;
* tratamento de opções de tipo de produção;
* construção da geometria espacial.

Após o processamento, os dados são inseridos na tabela:

```text
cadastro_produtores.produtores
```

O banco retorna o `id` e a `data_envio` do registro criado.

---

## 7. Consulta dos produtores

O backend disponibiliza duas formas principais de consulta dos produtores.

### 7.1 Consulta dos registros

```text
GET /api/produtores
```

Essa rota retorna os registros dos produtores juntamente com seus principais atributos e a representação GeoJSON da geometria.

Os resultados são ordenados pela data de envio de forma decrescente.

### 7.2 Consulta em GeoJSON

```text
GET /api/produtores/geojson
```

Essa rota é utilizada diretamente pelo frontend do WebGIS.

O backend consulta os registros que possuem geometria e utiliza:

```text
ST_AsGeoJSON(geom)
```

para transformar a geometria espacial em representação GeoJSON.

O resultado é organizado como:

```text
FeatureCollection
    ├── Feature
    ├── Feature
    ├── Feature
    └── ...
```

Cada `Feature` contém:

```text
geometry
properties
```

O frontend utiliza essa estrutura para representar os produtores como pontos no mapa.

---

## 8. Schema `assentamentos_bartolomeu` (área de estudo e caso - Unidade HIdrográfica do médio Rio São Bartolomeu)

O schema:

```text
assentamentos_bartolomeu
```

contém as tabelas referentes aos assentamentos utilizados pelo WebGIS.

Atualmente o backend está configurado para consultar:

```text
assentamentos_bartolomeu.assentamento_1

assentamentos_bartolomeu.assentamento_2

assentamentos_bartolomeu.assentamento_3
```

Esses dados são disponibilizados individualmente pela API.

Por razões de privacidade, os assentamentos que fizeram parte do estudo de caso, não foram nomeados na documentação do projeto. 

---

## 9. Geometria dos assentamentos

As tabelas dos assentamentos utilizam:

```text
Tipo geométrico: MULTIPOLYGON
SRID original: EPSG:31983
```

Antes de serem disponibilizadas ao frontend, as geometrias são transformadas para:

```text
EPSG:4326
```

O processo realizado pelo PostGIS é:

```text
Geometria EPSG:31983
        │
        ▼
ST_Transform()
        │
        ▼
Geometria EPSG:4326
        │
        ▼
ST_AsGeoJSON()
        │
        ▼
GeoJSON
```

Essa transformação permite que as geometrias sejam transmitidas ao frontend em um formato compatível com o fluxo cartográfico utilizado pela aplicação.

---

## 10. Consulta dos assentamentos

Os assentamentos são disponibilizados pela rota:

```text
GET /api/assentamentos/:assentamento
```

O parâmetro da rota identifica qual assentamento deve ser consultado.

Os identificadores atualmente configurados são:

```text
assentamento_1
assentamento_2
assentamento_3
```

O backend utiliza uma configuração interna que associa cada identificador à respectiva tabela do banco.

Após a consulta, os registros são convertidos para uma `FeatureCollection` GeoJSON.

---

## 11. Schema `unidades_hidrograficas_df`

O schema:

```text
unidades_hidrograficas_df
```

é utilizado para armazenar e consultar as unidades hidrográficas disponibilizadas pelo WebGIS.

A tabela utilizada atualmente pelo backend é:

```text
unidades_hidrograficas_df.unidades_hidrograficas
```

A aplicação consulta todas as feições que possuem geometria válida.

---

## 12. Geometria das unidades hidrográficas

Assim como ocorre com os assentamentos, o backend realiza uma transformação espacial antes de disponibilizar os dados ao frontend.

O fluxo implementado é:

```text
Geometria armazenada
        │
        ▼
ST_Transform(..., 4326)
        │
        ▼
ST_AsGeoJSON()
        │
        ▼
GeoJSON
        │
        ▼
Frontend WebGIS
```

O backend registra a geometria original das unidades hidrográficas como:

```text
SRID original: EPSG:31983
Geometria: MULTIPOLYGON
```

e disponibiliza o resultado em EPSG:4326.

---

## 13. Estrutura espacial dos dados

A organização espacial utilizada pelo sistema pode ser resumida da seguinte forma:

```text
PostgreSQL
│
└── PostGIS
    │
    ├── cadastro_produtores
    │   └── produtores
    │       └── POINT
    │           EPSG:4326
    │
    ├── assentamentos_bartolomeu
    │   ├── assentamento_1
    │   ├── assentamento_2
    │   └── assentamento_3
    │       └── MULTIPOLYGON
    │           EPSG:31983
    │
    └── unidades_hidrograficas_df
        └── unidades_hidrograficas
            └── MULTIPOLYGON
                EPSG:31983
```

---

## 14. Conversão para GeoJSON

O GeoJSON é utilizado como principal formato de intercâmbio entre o backend e o frontend para os dados espaciais.

O processo geral é:

```text
PostGIS
   │
   │ Consulta SQL
   ▼
Geometria espacial
   │
   │ ST_Transform()
   ▼
EPSG:4326
   │
   │ ST_AsGeoJSON()
   ▼
GeoJSON
   │
   ▼
API Express
   │
   ▼
OpenLayers
```

Para os produtores, a geometria já é armazenada em EPSG:4326.

Para os assentamentos e unidades hidrográficas, a transformação para EPSG:4326 é realizada durante a consulta.

---

## 15. Sistema de referência utilizado no frontend

O frontend OpenLayers recebe as geometrias em:

```text
EPSG:4326
```

e realiza a leitura dos dados utilizando:

```text
dataProjection: EPSG:4326
featureProjection: EPSG:3857
```

Dessa maneira, os dados espaciais são convertidos para o sistema de referência utilizado na visualização do mapa.

O WebGIS apresenta o EPSG 3857 em sua barra de status.

---

## 16. Integridade e validação espacial

Durante o cadastro dos produtores, o backend realiza validações básicas das coordenadas geográficas.

São verificadas as seguintes condições:

```text
-90 ≤ latitude ≤ 90

-180 ≤ longitude ≤ 180
```

Coordenadas que não atendam a esses limites são rejeitadas antes da inserção no banco.

O backend também verifica se latitude e longitude podem ser convertidas para valores numéricos válidos.

---

## 17. Segurança do banco de dados

As informações utilizadas para conexão com o PostgreSQL são armazenadas em variáveis de ambiente.

O backend utiliza:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

Essas informações são carregadas pelo pacote `dotenv`.


O arquivo:

```text
backend/.env
```

---

## 18. Comunicação com o banco

O backend utiliza um pool de conexões do pacote `pg`.

A conexão é configurada com as informações provenientes das variáveis de ambiente.

Ao iniciar o servidor, o backend realiza uma consulta de teste:

```sql
SELECT NOW()
```

para verificar a disponibilidade da conexão com o PostgreSQL.

Quando a conexão é estabelecida, o servidor registra informações básicas sobre o banco no console.

---

## 19. Operações espaciais utilizadas

As principais operações PostGIS utilizadas atualmente pelo backend são:

### `ST_MakePoint()`

Utilizada para construir a geometria pontual dos produtores a partir de longitude e latitude.

### `ST_SetSRID()`

Utilizada para definir o sistema de referência espacial da geometria dos produtores.

### `ST_Transform()`

Utilizada para transformar as geometrias dos assentamentos e das unidades hidrográficas para EPSG:4326.

### `ST_AsGeoJSON()`

Utilizada para converter as geometrias PostGIS em GeoJSON.

Essas operações permitem que os dados armazenados no banco espacial sejam utilizados diretamente pela aplicação cartográfica.

---

## 20. Fluxo geral do banco de dados

O funcionamento espacial do sistema pode ser resumido em:

```text
                    POSTGRESQL + POSTGIS
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
     Produtores         Assentamentos      Unidades
     POINT              MULTIPOLYGON       MULTIPOLYGON
     EPSG:4326          EPSG:31983          EPSG:31983
          │                  │                  │
          │                  └────────┬─────────┘
          │                           │
          │                    ST_Transform
          │                           │
          │                           ▼
          │                       EPSG:4326
          │                           │
          └──────────────┬────────────┘
                         │
                  ST_AsGeoJSON()
                         │
                         ▼
                     Backend
                         │
                         ▼
                    OpenLayers
```

---

## 21. Considerações finais

O PostgreSQL/PostGIS constitui a principal infraestrutura espacial do WebGIS.

A utilização do PostGIS permite centralizar os dados geográficos e disponibilizá-los de forma estruturada por meio da API desenvolvida em Node.js e Express.

A arquitetura atual mantém uma separação entre:

* armazenamento espacial;
* processamento das consultas;
* disponibilização dos dados;
* representação cartográfica.

Essa organização possibilita a incorporação futura de novas camadas geográficas, novos atributos e novos endpoints sem necessidade de alterar a estrutura fundamental de comunicação entre frontend, backend e banco espacial.

A estrutura documentada corresponde à versão atual do sistema e poderá ser atualizada à medida que novas funcionalidades ou conjuntos de dados forem incorporados ao WebGIS.
