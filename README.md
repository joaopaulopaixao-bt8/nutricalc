# NutriCalc

Sistema de cálculo nutricional e geração automática de dietas com foco em coerência alimentar realista, padrão de refeição brasileiro, área de usuário e histórico de saúde.

## Critério permanente de interface

Toda mudança visual e funcional do NutriCalc precisa sair pronta para desktop e mobile. Funcionamento impecável em mobile é imprescindível.

- mobile é requisito obrigatório, não acabamento posterior
- a interface precisa manter estética impecável em telas pequenas
- não pode haver corte de conteúdo, botões escondidos, overflow lateral ou perda de ação importante
- nenhuma tela deve ser considerada pronta sem validação visual e funcional em celular

## Estado atual

Marco atual registrado em 22/04/2026.

Hoje o projeto já entrega:
- cálculo de gasto energético e metas nutricionais
- geração automática de dietas com regras por tipo de refeição
- lógica separada para café da manhã, lanches, almoço e jantar
- substituições orientadas pelo papel do alimento na refeição
- validação global do dia para reduzir repetições ruins
- estilos alimentares: tradicional, carnívora estrita e carnívora com ovos/laticínios
- receitas prontas selecionáveis e fixáveis em refeições específicas
- exportação de relatório em PDF
- dietas e relatórios salvos por usuário
- autenticação por email/senha e preparação para Google Login
- recuperação de senha
- perfil com nome, email, sexo, data de nascimento e avatar
- avatar persistido via Supabase Storage
- histórico corporal com peso, altura, idade e percentual de gordura
- calculadora de percentual de gordura pela fórmula Navy
- dashboard logado com resumo de perfil, evolução, última dieta e último relatório
- páginas públicas de apresentação, privacidade, termos e metodologia
- painel inicial com área de configuração via engrenagem para regras do gerador
- acesso local pela rede usando o IP da máquina

## Últimos ajustes registrados

Este bloco é o ponto de partida para as próximas atualizações.

- adicionados estilos alimentares no fluxo de geração: `traditional`, `carnivore` e `carnivore_eggs_dairy`
- adicionada tabela/modelo `Recipe` no Prisma e rota `GET /api/recipes`
- adicionadas receitas prontas no seed, com macros calculados a partir dos ingredientes
- seleção de receitas no frontend, com aba separada de alimentos avulsos
- possibilidade de fixar uma receita em uma refeição específica antes de gerar a dieta
- o motor de dietas passou a descontar macros de receitas fixadas antes de completar a refeição
- dietas salvas agora guardam `dietType`, `selectedRecipeIds` e `fixedMeals`
- fluxo de perfil inicial ajustado para preencher dados do usuário sem travar a geração
- avatar passou a ser salvo/removido de forma persistente via Supabase Storage
- avatar do Google é importado para storage próprio quando possível, evitando depender da URL externa
- adicionadas rotas de saúde do storage de avatar: `/api/health/avatar-storage` e `/api/health/avatar-storage/write-check`
- calculadora Navy e ações em mobile receberam ajustes de usabilidade
- páginas públicas, autenticação e fluxos principais receberam polimento mobile
- exclusão de dietas, relatórios e registros corporais já está presente na área do usuário
- Sprint 1 executada: dieta carnívora estrita sem lista visual de carboidratos, sem seleção de carboidratos e com backend bloqueando alimentos `category: carb`
- Sprint 2 executada: carnívora com ovos/laticínios separada visualmente da tradicional, também sem carboidratos tradicionais na montagem
- Sprint 3 executada: base ampliada para 18 receitas prontas, com opções tradicionais, carnívoras estritas e carnívoras com ovos/laticínios
- Sprint 4 executada: filtros da montagem melhorados por tipo de refeição, categoria, papel alimentar, favoritos, selecionados e receitas selecionadas
- Sprint 5 executada: dietas salvas com filtros por estilo, objetivo, refeições, período, calorias e uso de receitas
- Sprint 6 executada: relatórios salvos com filtros por estilo, objetivo, período e vínculo com dieta, exibindo contexto da dieta vinculada
- Sprint 7 executada: checklist de validação do gerador documentado em [docs/VALIDATION_CHECKLIST.md](/c:/NutriCalc/docs/VALIDATION_CHECKLIST.md)
- Sprint 8 executada: checklist de produção e segurança documentado em [docs/PRODUCTION_CHECKLIST.md](/c:/NutriCalc/docs/PRODUCTION_CHECKLIST.md)
- nova frente de performance/UX iniciada em 24/04/2026: Sprint 1 de diagnóstico da entrada pública e do boot inicial documentada em [docs/FRONTEND_PERFORMANCE_SPRINT1.md](/c:/NutriCalc/docs/FRONTEND_PERFORMANCE_SPRINT1.md)

## Como retomar o desenvolvimento

Antes de iniciar a próxima atualização, partir deste estado:

1. Rodar backend e frontend localmente
2. Confirmar login/cadastro
3. Conferir perfil, avatar e histórico corporal
4. Gerar uma dieta tradicional
5. Gerar uma dieta carnívora estrita
6. Gerar uma dieta carnívora com ovos/laticínios
7. Testar seleção de receitas prontas
8. Testar receita fixada em uma refeição
9. Gerar relatório em PDF logado
10. Reabrir dieta e relatório pela área do usuário
11. Validar em desktop e mobile

Se esses pontos estiverem funcionando, a próxima mudança pode começar sem precisar reabrir a base inteira do projeto.

## Arquivos-chave para próximas mudanças

### Gerador de dietas

- [backend/src/services/dietEngine.js](/c:/NutriCalc/backend/src/services/dietEngine.js)
- [backend/src/config/dietGenerationConfig.js](/c:/NutriCalc/backend/src/config/dietGenerationConfig.js)
- [backend/src/routes/api.js](/c:/NutriCalc/backend/src/routes/api.js)

### Alimentos, receitas e estilos alimentares

- [backend/src/seed.js](/c:/NutriCalc/backend/src/seed.js)
- [backend/prisma/schema.prisma](/c:/NutriCalc/backend/prisma/schema.prisma)
- [frontend/src/NutriCalc.jsx](/c:/NutriCalc/frontend/src/NutriCalc.jsx)

### Usuário, autenticação e histórico

- [backend/src/routes/auth.js](/c:/NutriCalc/backend/src/routes/auth.js)
- [backend/src/services/authService.js](/c:/NutriCalc/backend/src/services/authService.js)
- [frontend/src/api.js](/c:/NutriCalc/frontend/src/api.js)
- [frontend/src/NutriCalc.jsx](/c:/NutriCalc/frontend/src/NutriCalc.jsx)

### Avatar e storage

- [backend/src/services/avatarService.js](/c:/NutriCalc/backend/src/services/avatarService.js)
- [backend/.env.example](/c:/NutriCalc/backend/.env.example)
- [DEPLOY_ONLINE.md](/c:/NutriCalc/DEPLOY_ONLINE.md)

## Cuidados antes de alterar

- manter compatibilidade com dietas já salvas no banco
- não remover campos recentes como `dietType`, `selectedRecipeIds` e `fixedMeals`
- validar receitas fixadas para não estourarem macros ou ficarem incompatíveis com a refeição
- manter filtros por `dietTags` alinhados entre alimentos, receitas, backend e frontend
- preservar o comportamento mobile como critério obrigatório de entrega
- proteger dados de saúde e dados de sessão em qualquer mudança de autenticação
- testar avatar com upload manual, remoção e login Google
- evitar mexer no motor de dietas sem testar os três estilos alimentares

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
│       │   ├── api.js
│       │   └── auth.js
│       ├── services/
│       │   ├── authService.js
│       │   ├── avatarService.js
│       │   └── dietEngine.js
│       ├── seed.js
│       └── index.js
├── frontend/
│   └── src/
│       ├── NutriCalc.jsx
│       └── api.js
├── start-local-test.bat
├── docs/
│   ├── PRODUCTION_CHECKLIST.md
│   └── VALIDATION_CHECKLIST.md
├── README.md
└── ROADMAP.md
```

## Funcionalidades atuais

- TDEE via Mifflin-St Jeor
- metas de cutting, manutenção e bulking
- macros configuráveis
- estilos alimentares com filtros de alimentos e receitas compatíveis
- base com alimentos classificados por refeição, papel alimentar, subgrupo e tags de dieta
- receitas prontas com ingredientes, macros e compatibilidade por estilo alimentar
- favoritos e seleção de alimentos
- seleção de receitas prontas
- fixação de receitas por refeição
- geração de dieta com coerência por horário
- substituições mais coerentes
- PDF de relatório
- persistência de dietas e relatórios por usuário
- autenticação, sessão e logout
- login com Google preparado por variáveis de ambiente
- recuperação de senha preparada para envio por email
- perfil do usuário com avatar
- histórico corporal e gráfico de evolução
- calculadora Navy para estimar percentual de gordura
- dashboard logado com retomada rápida
- painel de configuração da geração
- frontend acessível pela rede local

## Desenvolvimento local

Requisito de runtime:

- Node.js 18 ou superior

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

Variáveis locais esperadas:

- `DATABASE_URL`
- `PORT`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID`
- `RESET_PASSWORD_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_AVATAR_BUCKET`
- `NODE_ENV`

Use [backend/.env.example](/c:/NutriCalc/backend/.env.example) como referência.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend padrão: `http://localhost:5173`

Variáveis locais esperadas:

- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

Use [frontend/.env.example](/c:/NutriCalc/frontend/.env.example) como referência.

### Teste em rede local

Use:

```bat
start-local-test.bat
```

O script sobe o ambiente e mostra o link de acesso via IP da máquina para abrir no celular na mesma rede.

## Deploy

### Banco
- Supabase + PostgreSQL
- Supabase Storage para avatares

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
- Vercel com domínio público `https://nutricalc.spatium.top`

Build:

```bash
npm run build
```

## Migração online inicial

Para a primeira publicação com a stack atual:

- banco no `Supabase`
- storage de avatar no `Supabase Storage`
- backend no `Render`
- frontend na `Vercel` com domínio `https://nutricalc.spatium.top`

Arquivos de apoio já preparados no projeto:

- [render.yaml](/c:/NutriCalc/render.yaml)
- [backend/.env.example](/c:/NutriCalc/backend/.env.example)
- [frontend/.env.example](/c:/NutriCalc/frontend/.env.example)
- [DEPLOY_ONLINE.md](/c:/NutriCalc/DEPLOY_ONLINE.md)
- [docs/PRODUCTION_CHECKLIST.md](/c:/NutriCalc/docs/PRODUCTION_CHECKLIST.md)
- [docs/VALIDATION_CHECKLIST.md](/c:/NutriCalc/docs/VALIDATION_CHECKLIST.md)

## Próximo passo do produto

Muita coisa da área de usuário já foi implementada. O próximo ciclo não deve tratar login, perfil, histórico, dashboard e relatórios como ponto zero. A base agora é outra: o foco passa a ser lapidar o gerador, ampliar receitas, melhorar filtros e garantir que cada estilo alimentar tenha uma experiência coerente.

### Plano de evolução recomendado

1. Ajustar dieta carnívora
- remover lista visual de carboidratos quando o estilo for `carnivore`
- revisar macros padrão para evitar expectativa de carboidrato em dieta carnívora estrita
- garantir que alimentos com `category: carb` não apareçam como opção nesse estilo
- manter apenas proteínas, gorduras e receitas compatíveis com carnívora
- validar substituições para não sugerirem arroz, pão, frutas, aveia, feijão ou qualquer carbo-base

2. Ajustar carnívora com ovos e laticínios
- diferenciar melhor de `carnivore`
- permitir ovos, queijos e laticínios compatíveis
- impedir que carboidratos tradicionais apareçam por acidente
- revisar receitas próprias desse estilo para café, almoço, jantar e lanches

3. Ampliar receitas prontas sem quebrar coerência
- criar mais receitas para dieta tradicional
- criar receitas específicas para carnívora estrita
- criar receitas específicas para carnívora com ovos/laticínios
- classificar cada receita com `mealTypes` correto
- classificar cada receita com `dietTags` correto
- testar receita fixada em refeição antes de considerar pronta
- impedir receita incompatível com horário ou estilo alimentar

4. Melhorar filtros da montagem
- filtro por estilo alimentar
- filtro por tipo de refeição
- filtro por categoria: proteína, carboidrato, gordura e receita
- filtro por favoritos
- filtro por receitas selecionadas
- filtro por alimentos disponíveis para substituição
- deixar claro na interface quando uma categoria não se aplica ao estilo escolhido

5. Melhorar visualização da área de dietas salvas
- filtrar dietas por estilo alimentar
- filtrar por objetivo: cutting, manutenção e bulking
- filtrar por data ou período
- exibir se a dieta usou receitas prontas
- permitir retomada mais clara da última dieta

6. Melhorar visualização de relatórios salvos
- filtrar por data
- filtrar por dieta vinculada
- exibir objetivo, calorias e estilo alimentar no item do relatório
- facilitar reabertura sem depender de lembrar qual dieta gerou o PDF

7. Criar critérios de validação do gerador
- gerar dieta tradicional com alimentos avulsos
- gerar dieta tradicional com receita fixa
- gerar carnívora estrita sem carboidratos visuais ou alimentares
- gerar carnívora com ovos/laticínios sem carboidratos tradicionais
- testar substituições em todos os estilos
- testar PDF das dietas geradas
- testar reabertura de dieta salva
- validar tudo em desktop e mobile

8. Preparar produção com mais segurança
- testar o fluxo completo em ambiente online real
- revisar variáveis de produção no Render, Vercel e Supabase
- ativar envio real de email para recuperação de senha
- configurar Google Login com domínio final
- decidir se a autenticação seguirá com token em `localStorage` ou migrará para cookie `HTTP-only`

### Plano de execução por sprints

#### Sprint 1: Corrigir experiência da dieta carnívora

Objetivo:
- fazer a dieta `carnivore` se comportar como carnívora estrita de verdade

Status:
- executada

Entregas:
- esconder lista/aba de carboidratos no frontend quando o estilo for `carnivore`
- remover carboidratos dos contadores, mensagens e seletores desse estilo
- bloquear alimentos `category: carb` no backend para `carnivore`
- revisar presets de macro para carboidrato mínimo ou zero
- garantir que substituições não tragam carboidratos tradicionais

Validação:
- gerar dieta carnívora sem aparecer arroz, pão, fruta, aveia, feijão, tubérculo ou massa
- conferir resultado em desktop e mobile
- gerar PDF e reabrir dieta salva

#### Sprint 2: Refinar carnívora com ovos e laticínios

Objetivo:
- separar melhor `carnivore_eggs_dairy` da carnívora estrita

Status:
- executada

Entregas:
- revisar filtros de alimentos permitidos
- permitir ovos, queijos e laticínios compatíveis
- impedir carboidratos tradicionais nesse estilo
- ajustar textos da interface para explicar a diferença entre os dois estilos carnívoros
- revisar substituições específicas desse estilo

Validação:
- gerar dieta com ovos/laticínios sem alimentos de carbo-base
- testar café, lanche, almoço e jantar
- testar PDF e dieta salva

#### Sprint 3: Ampliar receitas prontas com segurança

Objetivo:
- aumentar repertório de receitas sem quebrar o motor de dieta

Status:
- executada

Entregas:
- adicionar novas receitas tradicionais
- adicionar receitas carnívoras estritas
- adicionar receitas carnívoras com ovos/laticínios
- revisar `mealTypes` e `dietTags` de cada receita
- validar cálculo de macros das receitas no seed
- garantir que receita fixa só entre em refeição compatível

Validação:
- gerar dietas com receitas livres
- gerar dietas com receita fixa por refeição
- testar incompatibilidades de estilo/refeição
- conferir se os macros finais continuam coerentes

#### Sprint 4: Melhorar filtros da montagem

Objetivo:
- deixar a escolha de alimentos e receitas mais clara e controlada

Status:
- executada

Entregas:
- filtro por estilo alimentar
- filtro por tipo de refeição
- filtro por categoria aplicável ao estilo
- filtro por favoritos
- filtro por receitas selecionadas
- mensagem clara quando uma categoria não se aplica ao estilo escolhido
- impedir que filtros gerem listas confusas ou vazias sem explicação

Validação:
- navegar pelos filtros nos três estilos alimentares
- testar em mobile sem overflow ou botões escondidos
- confirmar que a troca de estilo limpa seleções incompatíveis

#### Sprint 5: Melhorar dietas salvas

Objetivo:
- facilitar revisão e retomada de dietas antigas

Status:
- executada

Entregas:
- filtro por estilo alimentar
- filtro por objetivo
- filtro por data/período
- indicador de dieta com receita pronta
- exibição mais clara de calorias, refeições e estilo
- retomada rápida da última dieta

Validação:
- salvar dietas dos três estilos
- filtrar e reabrir dietas
- excluir dieta e confirmar atualização da lista
- validar mobile

#### Sprint 6: Melhorar relatórios salvos

Objetivo:
- conectar melhor relatório, dieta e contexto da geração

Status:
- executada

Entregas:
- filtro por data/período
- exibição da dieta vinculada
- exibição de objetivo, calorias e estilo alimentar
- indicação quando relatório veio de dieta com receita pronta
- reabertura mais clara do relatório

Validação:
- gerar relatórios para dietas diferentes
- reabrir relatórios pela área do usuário
- excluir relatório e confirmar atualização da lista
- validar PDF e mobile

#### Sprint 7: Criar checklist de validação do gerador

Objetivo:
- evitar regressões no motor antes de novas mudanças grandes

Status:
- executada

Documento:
- [docs/VALIDATION_CHECKLIST.md](/c:/NutriCalc/docs/VALIDATION_CHECKLIST.md)

Entregas:
- checklist manual documentado no README ou ROADMAP
- cenários mínimos para os três estilos alimentares
- cenários com e sem receita fixa
- cenários de substituição
- cenários de PDF e dieta salva

Validação:
- executar o checklist completo antes de fechar a sprint
- registrar falhas encontradas como próximos ajustes

#### Sprint 8: Preparar produção com mais segurança

Objetivo:
- deixar o sistema mais pronto para uso online real

Status:
- executada

Documento:
- [docs/PRODUCTION_CHECKLIST.md](/c:/NutriCalc/docs/PRODUCTION_CHECKLIST.md)

Entregas:
- revisar variáveis de produção no Render, Vercel e Supabase
- testar Supabase Storage de avatar em produção
- configurar envio real de recuperação de senha
- configurar Google Login no domínio final
- revisar CORS e URLs públicas
- decidir estratégia futura de sessão: `localStorage` ou cookie `HTTP-only`

Validação:
- cadastro, login, logout e recuperação de senha em ambiente online
- upload/removal de avatar em ambiente online
- geração de dieta, relatório e reabertura em produção
- teste mobile no domínio publicado

Ordem recomendada:

1. Sprint 1
2. Sprint 2
3. Sprint 4
4. Sprint 3
5. Sprint 5
6. Sprint 6
7. Sprint 7
8. Sprint 8

Observação:
- A Sprint 4 vem antes da ampliação pesada de receitas para evitar crescer a base em cima de filtros confusos.
- A Sprint 7 consolida a validação depois das mudanças principais no gerador e antes do foco em produção.

O detalhamento disso está em:
- [ROADMAP.md](/c:/NutriCalc/ROADMAP.md)
