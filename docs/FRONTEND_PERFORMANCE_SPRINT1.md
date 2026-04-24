# Sprint 1 - Diagnóstico de performance e entrada pública

Data: 24/04/2026

## Objetivo da sprint

Entender por que a entrada do NutriCalc está lenta, quais cargas acontecem cedo demais e quais pontos deixam a experiência pública pesada, técnica e pouco comercial.

## Baseline encontrado

### 1. A entrada pública fica bloqueada pelo bootstrap de autenticação

Hoje o app só decide o que renderizar depois que termina `fetchCurrentUser()`.

Referências:
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:836)
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:1130)
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:2300)

Efeito prático:
- qualquer visitante novo vê a tela `Carregando seu acesso...`
- a home pública não aparece imediatamente
- se a checagem de sessão atrasar, o site inteiro parece lento

### 2. O visitante anônimo já dispara carga de dados do gerador

Mesmo sem login, o boot atual carrega:
- `GET /api/foods?category=protein`
- `GET /api/foods?category=carb`
- `GET /api/foods?category=fat`
- `GET /api/recipes`
- `GET /api/config/diet-generation`
- `GET /api/auth/me`

Referências:
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:1077)
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:1110)
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:1242)
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:1130)
- [frontend/src/api.js](C:\NutriCalc\frontend\src\api.js:1)

Impacto:
- pelo menos 6 requests já no primeiro acesso
- parte importante dessa carga não é necessária para mostrar a landing
- a percepção de lentidão cresce mesmo antes de qualquer interação

### 3. Usuário logado recebe carga adicional logo no boot

Assim que `authUser` existe, o app também carrega:
- `fetchBodyMetrics(90)`
- `fetchMyDiets({ days: 90 })`
- `fetchMyReports({ days: 90 })`

Referência:
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:1308)

Impacto:
- usuário autenticado pode iniciar com 9 requests ou mais
- parte do dashboard é carregada antes de confirmar se a pessoa realmente vai abrir perfil ou histórico

### 4. Existe chance de carga duplicada em fluxos de perfil

Quando `profileOpen` muda, o app possui efeitos paralelos que podem repetir parte da carga de:
- métricas corporais
- dietas
- relatórios

Referências:
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:1283)
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:1308)
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:1340)
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:1365)

Isso não é o principal gargalo da landing, mas aumenta o custo inicial do app autenticado.

### 5. A experiência pública está muito textual e pouco comercial

A entrada pública atual prioriza explicação do sistema, privacidade, termos e metodologia já no começo da jornada.

Referências:
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:3187)
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:3190)
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:3344)
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:3385)
- [frontend/src/NutriCalc.jsx](C:\NutriCalc\frontend\src\NutriCalc.jsx:3426)

Impacto:
- a home parece institucional/técnica
- o valor do produto demora para aparecer
- o visitante precisa ler demais antes de agir

### 6. Arquitetura do frontend dificulta evolução rápida da entrada

`frontend/src/NutriCalc.jsx` está com 4456 linhas e concentra:
- home pública
- páginas de privacidade, termos e metodologia
- autenticação
- dashboard
- gerador
- perfil

Impacto:
- qualquer mudança na home corre risco de tocar o app inteiro
- a separação entre site público e área autenticada está fraca
- manutenção e otimização ficam mais lentas

## Resumo dos gargalos prioritários

1. Splash global bloqueando a primeira renderização pública.
2. Requests do gerador acontecendo antes do login.
3. Dashboard autenticado buscando dados cedo demais.
4. Home pública longa, densa e pouco visual.
5. Arquivo único grande demais para evoluir com segurança.

## Direção aprovada para a Sprint 2

### Meta principal

Fazer a landing pública aparecer imediatamente, sem depender da conclusão do bootstrap de autenticação.

### Cortes previstos

1. Remover o bloqueio global de `authBootstrapLoading`.
2. Renderizar a experiência pública primeiro.
3. Rodar `fetchCurrentUser()` em paralelo, sem travar a tela.
4. Preparar fallback suave para alternar entre visitante e usuário logado.

## Direção aprovada para a Sprint 3

Mover para carregamento sob demanda:
- alimentos
- receitas
- configuração da geração
- dashboard autenticado

## Direção aprovada para Sprints 4 a 8

- separar melhor a camada pública da autenticada
- reescrever a home com linguagem comercial
- substituir blocos longos por seções curtas e orientadas a benefício
- inserir imagens reais ou geradas com apelo fitness/nutrição
- otimizar bundle inicial e carregamento visual

## Critério de conclusão da Sprint 1

Sprint 1 concluída com:
- mapeamento do boot atual
- identificação dos requests iniciais
- diagnóstico dos gargalos mais relevantes
- definição objetiva do que entra nas próximas sprints
