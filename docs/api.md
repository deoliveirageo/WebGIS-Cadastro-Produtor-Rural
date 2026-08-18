# API — WebGIS Geografia Agrária

## 1. Visão geral

A API do **WebGIS Geografia Agrária** é responsável pela comunicação entre a aplicação frontend e o banco de dados PostgreSQL/PostGIS.

O backend foi desenvolvido em **Node.js** utilizando o framework **Express** e disponibiliza endpoints HTTP para consulta e armazenamento de informações geográficas.

A API funciona como uma camada intermediária entre o usuário e o banco espacial, evitando que o frontend tenha acesso direto às credenciais ou à estrutura de conexão do PostgreSQL/PostGIS.

---

## 2. Tecnologias

A API utiliza:

* Node.js;
* Express;
* PostgreSQL;
* PostGIS;
* `pg`;
* CORS;
* dotenv;
* JSON;
* GeoJSON.

O servidor é executado, no ambiente de desenvolvimento, na porta:

```text
3001
```

O frontend Vite utiliza uma configuração de proxy para encaminhar as requisições `/api` ao backend.

---

## 3. Arquitetura de comunicação

O fluxo geral da comunicação é:

```text
┌──────────────────────┐
│      FRONTEND        │
│  OpenLayers + Vite   │
└──────────┬───────────┘
           │
           │ HTTP / Fetch
           ▼
┌──────────────────────┐
│       EXPRESS        │
│       API            │
│      :3001           │
└──────────┬───────────┘
           │
           │ SQL
           ▼
┌──────────────────────┐
│ PostgreSQL + PostGIS │
└──────────────────────┘
```

Para dados espaciais, o backend realiza consultas ao PostGIS, converte as geometrias quando necessário e disponibiliza os resultados em GeoJSON.

---

# 4. Endpoints disponíveis

A versão atual da API possui os seguintes endpoints:

| Método | Endpoint                              | Finalidade                       |
| ------ | ------------------------------------- | -------------------------------- |
| `GET`  | `/`                                   | Verificar o funcionamento da API |
| `POST` | `/api/produtores`                     | Cadastrar produtor               |
| `GET`  | `/api/produtores`                     | Consultar produtores             |
| `GET`  | `/api/produtores/geojson`             | Consultar produtores em GeoJSON  |
| `GET`  | `/api/assentamentos/:assentamento`    | Consultar assentamento           |
| `GET`  | `/api/camadas/unidades-hidrograficas` | Consultar unidades hidrográficas |

---

# 5. Endpoint de status

## `GET /`

Utilizado para verificar se a API está funcionando.

### Requisição

```http
GET /
```

### Resposta

A API retorna um objeto JSON contendo:

```json
{
  "mensagem": "API do WebGIS funcionando.",
  "banco": "PostgreSQL + PostGIS",
  "status": "online"
}
```

Esse endpoint funciona como uma verificação básica de disponibilidade do servidor.

---

# 6. Cadastro de produtores

## `POST /api/produtores`

Responsável por receber os dados de um produtor e armazená-los no PostgreSQL/PostGIS.

### Requisição

```http
POST /api/produtores
Content-Type: application/json
```

Os dados são enviados no corpo da requisição em formato JSON.

### Principais informações recebidas

A API trabalha com informações relacionadas a:

* nome do produtor;
* tipo de produção;
* núcleo rural ou assentamento;
* cultura ou criação;
* área;
* comercialização;
* programas governamentais;
* cooperativa ou associação;
* dificuldades;
* latitude;
* longitude;
* contato;
* precisão GPS.

### Processamento

Antes da inserção, o backend realiza validações e transformações.

#### Coordenadas

Latitude e longitude são convertidas para números.

A API verifica se os valores estão dentro dos limites geográficos válidos:

```text
Latitude:
-90 a 90

Longitude:
-180 a 180
```

#### Área

Quando informada, a área é convertida para valor numérico.

#### Precisão GPS

A precisão recebida é convertida para valor numérico.

#### Dificuldades

Quando múltiplas dificuldades são recebidas como array, os valores são unidos em uma única string.

#### Cooperativa ou associação

O backend transforma as opções de participação em valores adequados para armazenamento.

#### Programas governamentais

O mesmo procedimento é utilizado para as informações referentes à participação em programas governamentais.

#### Tipo de produção

Quando a opção `outro` é utilizada, o backend utiliza o campo complementar informado pelo usuário.

---

## 6.1 Construção da geometria

A posição do produtor é convertida em geometria PostGIS.

O processo utiliza:

```sql
ST_SetSRID(
    ST_MakePoint(
        longitude,
        latitude
    ),
    4326
)
```

A ordem das coordenadas é:

```text
longitude
latitude
```

O ponto é armazenado em:

```text
EPSG:4326
```

---

## 6.2 Inserção no banco

Os dados são inseridos na tabela:

```text
cadastro_produtores.produtores
```

O backend utiliza uma consulta SQL parametrizada para realizar a operação.

A consulta retorna:

```text
id
data_envio
```

do registro criado.

---

## 6.3 Resposta de sucesso

Em caso de sucesso, a API retorna HTTP:

```text
201 Created
```

com uma resposta semelhante a:

```json
{
  "sucesso": true,
  "mensagem": "Produtor armazenado no PostgreSQL/PostGIS.",
  "id": 1,
  "data_envio": "..."
}
```

O valor do `id` e da `data_envio` corresponde ao registro efetivamente criado no banco.

---

## 6.4 Erros

Caso nenhum dado seja recebido:

```text
400 Bad Request
```

Caso latitude ou longitude sejam inválidas:

```text
400 Bad Request
```

Caso a área seja inválida:

```text
400 Bad Request
```

Em caso de erro durante a operação com o banco:

```text
500 Internal Server Error
```

---

# 7. Consulta de produtores

## `GET /api/produtores`

Retorna os produtores armazenados no banco.

### Requisição

```http
GET /api/produtores
```

### Banco consultado

```text
cadastro_produtores.produtores
```

### Informações retornadas

A consulta inclui:

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
* geometria;
* `data_envio`.

A geometria é convertida para GeoJSON através de:

```sql
ST_AsGeoJSON(geom)
```

Os registros são ordenados por:

```text
data_envio DESC
```

---

# 8. Produtores em GeoJSON

## `GET /api/produtores/geojson`

Esse é o endpoint utilizado pelo frontend principal do WebGIS para carregar os produtores no mapa.

### Requisição

```http
GET /api/produtores/geojson
```

### Funcionamento

O backend consulta somente registros que possuem geometria:

```sql
WHERE geom IS NOT NULL
```

As geometrias são convertidas para GeoJSON.

Cada registro é transformado em uma `Feature`.

O resultado final é uma:

```text
FeatureCollection
```

### Estrutura da resposta

A estrutura geral é:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {},
      "properties": {}
    }
  ]
}
```

Os atributos do produtor são disponibilizados dentro de:

```text
properties
```

e sua geometria dentro de:

```text
geometry
```

---

# 9. Fluxo dos produtores no WebGIS

O carregamento dos produtores segue o seguinte fluxo:

```text
PostgreSQL/PostGIS
        │
        ▼
cadastro_produtores.produtores
        │
        ▼
GET /api/produtores/geojson
        │
        ▼
Express
        │
        ▼
FeatureCollection GeoJSON
        │
        ▼
OpenLayers
        │
        ▼
Pontos dos produtores
```

O frontend converte os dados recebidos de EPSG:4326 para EPSG:3857 para representação no mapa.

---

# 10. Assentamentos

## `GET /api/assentamentos/:assentamento`

Responsável por fornecer os dados geográficos de um assentamento específico.

### Parâmetro

O endpoint utiliza o parâmetro:

```text
:assentamento
```

Os identificadores atualmente disponíveis são:

```text
assentamento_1
assentamento_2
assentamento_3
```

### Exemplos

```http
GET /api/assentamentos/assentamento_1
```

```http
GET /api/assentamentos/assentamento_2
```

```http
GET /api/assentamentos/assentamento_3
```

---

## 10.1 Tabelas correspondentes

| Identificador     | Tabela                         |
| ----------------- | ------------------------------ |
| `assentamento_1` | `assentamento_assentamento_1` |
| `assentamento_2` | `assentamento_assentamento_2` |
| `assentamento_3` | `assentamento_assentamento_3` |

Todas estão no schema:

```text
assentamentos_bartolomeu
```

---

## 10.2 Processamento espacial

As geometrias dos assentamentos são originalmente armazenadas em:

```text
EPSG:31983
```

O backend realiza:

```sql
ST_Transform(
    geom,
    4326
)
```

e posteriormente:

```sql
ST_AsGeoJSON(...)
```

O resultado é disponibilizado como GeoJSON.

---

## 10.3 Resposta

O endpoint retorna uma:

```text
FeatureCollection
```

com as geometrias e os atributos dos assentamentos.

Cada feição também recebe o atributo:

```text
nome_assentamento
```

para identificação no frontend.

---

## 10.4 Assentamento inexistente

Quando o identificador informado não está configurado na API, o servidor retorna:

```text
404 Not Found
```

com uma resposta JSON indicando que o assentamento não foi encontrado.

---

# 11. Unidades hidrográficas

## `GET /api/camadas/unidades-hidrograficas`

Responsável por fornecer as unidades hidrográficas utilizadas pelo WebGIS.

### Requisição

```http
GET /api/camadas/unidades-hidrograficas
```

### Banco consultado

```text
unidades_hidrograficas_df.unidades_hidrograficas
```

O backend consulta as feições que possuem geometria válida.

---

## 11.1 Processamento espacial

As geometrias são transformadas para EPSG:4326:

```sql
ST_Transform(
    geom,
    4326
)
```

Depois são convertidas para GeoJSON:

```sql
ST_AsGeoJSON(...)
```

---

## 11.2 Resposta

A resposta possui estrutura de `FeatureCollection`:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {},
      "properties": {}
    }
  ]
}
```

Os atributos da tabela são mantidos em `properties`.

---

# 12. Fluxo das unidades hidrográficas

O carregamento ocorre da seguinte forma:

```text
PostgreSQL/PostGIS
        │
        ▼
unidades_hidrograficas_df
        │
        ▼
GET /api/camadas/unidades-hidrograficas
        │
        ▼
Express
        │
        ▼
GeoJSON
        │
        ▼
OpenLayers
        │
        ▼
Unidades hidrográficas
```

No frontend, as unidades podem ser ativadas individualmente e seus rótulos são exibidos conforme o nível de zoom.

---

# 13. Formato GeoJSON

Os endpoints espaciais utilizam **GeoJSON** como formato de intercâmbio entre backend e frontend.

A estrutura básica utilizada é:

```text
FeatureCollection
│
├── Feature
│   ├── geometry
│   └── properties
│
├── Feature
│   ├── geometry
│   └── properties
│
└── ...
```

Esse formato permite que as geometrias e seus atributos sejam transferidos em uma estrutura compatível com a biblioteca OpenLayers.

---

# 14. Sistemas de referência

A API trabalha com diferentes sistemas de referência dependendo da origem dos dados.

### Produtores

Os produtores são armazenados em:

```text
EPSG:4326
```

### Assentamentos

As geometrias são armazenadas originalmente em:

```text
EPSG:31983
```

e transformadas para:

```text
EPSG:4326
```

antes da geração do GeoJSON.

### Unidades hidrográficas

As geometrias são transformadas para:

```text
EPSG:4326
```

antes de serem disponibilizadas pela API.

O frontend realiza posteriormente a conversão para EPSG:3857 para utilização no OpenLayers.

---

# 15. Vite Proxy

Durante o desenvolvimento, o frontend Vite utiliza um proxy para encaminhar as requisições da API.

A configuração é:

```text
/api
   │
   ▼
http://localhost:3001
```

Assim, quando o frontend solicita:

```http
GET /api/produtores/geojson
```

a requisição é encaminhada pelo servidor de desenvolvimento Vite ao backend Express.

Esse mecanismo permite manter as chamadas da aplicação utilizando o caminho `/api`.

---

# 16. Tratamento de erros

A API utiliza códigos HTTP para indicar diferentes situações.

### `200 OK`

Utilizado para respostas de consulta realizadas com sucesso.

### `201 Created`

Utilizado após a criação bem-sucedida de um novo produtor.

### `400 Bad Request`

Utilizado quando os dados enviados são inválidos ou insuficientes.

### `404 Not Found`

Utilizado quando o assentamento solicitado não está configurado na API.

### `500 Internal Server Error`

Utilizado quando ocorre um erro durante o processamento no servidor ou na comunicação com o banco.

---

# 17. Segurança

As credenciais do PostgreSQL são carregadas através de variáveis de ambiente.

As principais variáveis utilizadas pelo backend são:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

---

# 18. Relação entre API e frontend

O frontend utiliza diretamente os endpoints espaciais da API para alimentar as camadas do mapa.

O fluxo é:

```text
OpenLayers
    │
    │ fetch()
    ▼
Express API
    │
    ▼
PostgreSQL/PostGIS
    │
    ▼
GeoJSON
    │
    ▼
OpenLayers
```

Os principais endpoints utilizados pelo `main.js` são:

```text
/api/produtores/geojson

/api/assentamentos/:assentamento

/api/camadas/unidades-hidrograficas
```

Dessa forma, o frontend permanece responsável pela apresentação e interação cartográfica, enquanto o backend concentra as operações de acesso aos dados.


# 19. Exemplo de fluxo completo

Um exemplo de consulta espacial de produtores pode ser representado por:

```text
1. Usuário acessa o WebGIS
             │
             ▼
2. Frontend inicia a aplicação
             │
             ▼
3. main.js solicita:
   /api/produtores/geojson
             │
             ▼
4. Vite encaminha a requisição
   para localhost:3001
             │
             ▼
5. Express recebe a requisição
             │
             ▼
6. Backend executa SQL no PostGIS
             │
             ▼
7. PostGIS retorna as geometrias
             │
             ▼
8. Backend gera FeatureCollection
   GeoJSON
             │
             ▼
9. Frontend recebe os dados
             │
             ▼
10. OpenLayers converte as geometrias
    para EPSG:3857
             │
             ▼
11. Produtores são exibidos no mapa
```

---

# 20. Evolução da API

A estrutura atual da API permite a incorporação futura de novos endpoints para:

* novas camadas geográficas;
* novos conjuntos de dados;
* consultas espaciais específicas;
* filtros;
* análises;
* operações de edição;
* novas informações relacionadas aos produtores.

Novos endpoints devem manter o padrão de organização utilizado na API atual, separando as responsabilidades de consulta, processamento e disponibilização dos dados.

---

# 21. Considerações finais

A API constitui a camada de integração entre a interface WebGIS e o banco de dados espacial.

Sua utilização permite que o frontend trabalhe com dados geográficos sem estabelecer conexão direta com o PostgreSQL/PostGIS.

A arquitetura atual utiliza GeoJSON como principal formato de transferência das geometrias entre backend e frontend, enquanto o PostGIS permanece responsável pelo armazenamento espacial.

A documentação apresentada corresponde à versão atual da API implementada no projeto e será atualizada sempre que novos endpoints, parâmetros, camadas ou operações forem incorporados ao sistema.
