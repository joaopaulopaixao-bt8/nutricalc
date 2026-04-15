# NutriCalc

Sistema de cálculo nutricional e geração automática de dietas com foco em coerência alimentar realista, padrão de refeição brasileiro e evolução futura para área de usuário com histórico de saúde.

## Critério permanente de interface

Toda mudança visual e funcional do NutriCalc precisa sair pronta para desktop e mobile.

- mobile é requisito obrigatório, não acabamento posterior
- a interface precisa manter estética impecável em telas pequenas
- não pode haver corte de conteúdo, botões escondidos, overflow lateral ou perda de ação importante
- nenhuma tela deve ser considerada pronta sem validação visual e funcional em celular

## Estado atual

Hoje o projeto já entrega:
- cálculo de gasto energético e metas nutricionais
- geração automática de dietas com regras por tipo de refeição
- lógica separada para café da manhã, lanches, almoço e jantar
- substituições orientadas pelo papel do alimento na refeição
- validação global do dia para reduzir repetições ruins
- exportação de relatório em PDF
- dietas salvas no banco
- painel inicial com área de configuração via engrenagem
- acesso local pela rede usando o IP da máquina

## Arquitetura

```text
Frontend (React + Vite + Tailwind)
Backend  (Node.js + Express)
Banco    (PostgreSQL + Prisma)
```

## O que foi refinado no gerador

O motor de dietas foi reorganizado em 6 fases já implementadas:

1. Café da manhã
- ovos priorizados como proteína principal quando disponíveis
- whey virou fallback, não padrão
- queijo e laticínios ficaram como complemento

2. Lanches
- whey puxado para o lugar certo
- lanche estruturado como shake, mingau ou lanche proteico prático
- aveia e fruta ganharam prioridade melhor nesse contexto

3. Almoço
- proteína principal de prato
- carbo-base de refeição principal
- feijão tratado como componente estrutural quando disponível

4. Jantar
- separação entre jantar-prato e jantar-sanduíche natural
- sem cair em shake improvisado

5. Substituições
- trocas passaram a respeitar papel alimentar e refeição
- exemplo: carne troca por carne de refeição principal, não por ovo ou feijão

6. Coerência global do dia
- validação final do dia
- redução de repetição excessiva entre refeições
- diversificação leve entre almoço/jantar e entre lanches

## Configuração do gerador

O projeto já possui uma configuração central de geração de dietas no backend:
- [backend/src/config/dietGenerationConfig.js](/c:/NutriCalc/backend/src/config/dietGenerationConfig.js)

Essa configuração hoje cobre:
- participação mínima de proteína principal por refeição
- limites de porção por alimento
- limites por subgrupo alimentar
- regras-base por tipo de refeição

Na interface, já existe uma área de engrenagem na tela inicial para editar parte dessas regras e visualizar papéis alimentares.

## Estrutura principal

```text
nutricalc/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── config/
│       │   └── dietGenerationConfig.js
│       ├── routes/
│       │   └── api.js
│       ├── services/
│       │   └── dietEngine.js
│       ├── seed.js
│       └── index.js
├── frontend/
│   └── src/
│       ├── NutriCalc.jsx
│       └── api.js
├── start-local-test.bat
├── README.md
└── ROADMAP.md
```

## Funcionalidades atuais

- TDEE via Mifflin-St Jeor
- metas de cutting, manutenção e bulking
- macros configuráveis
- base com alimentos classificados por refeição e papel alimentar
- favoritos e seleção de alimentos
- geração de dieta com coerência por horário
- substituições mais coerentes
- PDF de relatório
- persistência de dietas
- painel de configuração da geração
- frontend acessível pela rede local

## Desenvolvimento local

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node src/seed.js
npm run dev
```

Backend padrão: `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend padrão: `http://localhost:5173`

### Teste em rede local

Use:

```bat
start-local-test.bat
```

O script sobe o ambiente e mostra o link de acesso via IP da máquina para abrir no celular na mesma rede.

## Deploy

### Banco
- Supabase + PostgreSQL

### Backend
- Render

Build sugerido:

```bash
npm install && npx prisma generate && npx prisma db push && node src/seed.js
```

Start:

```bash
node src/index.js
```

### Frontend
- Vercel

Build:

```bash
npm run build
```

## Migração online inicial

Para a primeira publicação com a stack atual:

- banco no `Supabase`
- backend no `Render`
- frontend na `Vercel`

Arquivos de apoio já preparados no projeto:

- [render.yaml](/c:/NutriCalc/render.yaml)
- [backend/.env.example](/c:/NutriCalc/backend/.env.example)
- [frontend/.env.example](/c:/NutriCalc/frontend/.env.example)
- [DEPLOY_ONLINE.md](/c:/NutriCalc/DEPLOY_ONLINE.md)

## Próximo passo do produto

O próximo grande eixo do projeto é a área de usuário, com:
- login próprio e via Google
- avatar/foto de perfil
- histórico de peso, altura, idade e percentual de gordura
- gráfico de evolução
- histórico de dietas e relatórios

O detalhamento disso está em:
- [ROADMAP.md](/c:/NutriCalc/ROADMAP.md)
