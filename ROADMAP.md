# Roadmap NutriCalc

## Visão do produto

O NutriCalc começou como um gerador de dietas e está evoluindo para um sistema mais completo de acompanhamento nutricional e histórico de saúde.

A visão atual do produto é juntar três camadas:
- geração inteligente de dietas
- histórico pessoal de saúde
- área do usuário com perfil, evolução e reabertura de planos e relatórios

## O que já foi concluído

### Status de execução
- Sprint 1 concluída: autenticação
- Sprint 2 concluída: perfil e avatar
- Sprint 3 concluída: histórico corporal
- Sprint 4 concluída: calculadora Navy
- Sprint 5 concluída: evolução com gráfico e filtro por período
- Sprint 6 concluída: dietas do usuário com snapshot corporal e reabertura
- Sprint 7 concluída: relatórios do usuário com histórico, listagem e reabertura
- Sprint 8 concluída: dashboard com resumo do perfil, evolução e retomada rápida
- Sprint 9 concluída: segurança, auditoria básica e refinamentos de privacidade/UX

### Núcleo de dieta
- cálculo nutricional base
- seleção de alimentos
- geração automática de dietas
- exportação de PDF
- persistência de dietas

### Regras alimentares por refeição
- café da manhã com ovos como prioridade quando disponíveis
- whey priorizado nos lanches
- almoço com proteína principal + carbo-base + feijão estrutural
- jantar separado entre prato leve e jantar prático
- substituições orientadas por papel alimentar
- validação global do dia com diversificação leve

### Configuração do sistema
- configuração central de regras do gerador
- área de engrenagem na tela inicial
- papéis alimentares no seed e na interface

### Infra local
- acesso do frontend pela rede local usando IP da máquina
- backend com CORS ajustado para rede local

### Publicação externa futura
- manter checklist separado para quando o sistema sair do ambiente local
- preparar backend e frontend para domínios públicos
- revisar autenticação Google em domínio real
- revisar armazenamento de avatar para ambiente externo
- revisar segurança de CORS, URLs públicas e variáveis de ambiente

## Próxima frente: Área do usuário

Essa frente vai transformar o sistema em algo além de um gerador de dietas.

### Objetivos
- criar conta de usuário
- manter perfil individual
- guardar histórico corporal
- acompanhar evolução em gráfico
- salvar histórico de dietas e relatórios por usuário

## Escopo planejado da área do usuário

### Autenticação
- login próprio com email e senha
- login via Google
- recuperação de senha
- sessão segura com JWT + refresh token ou cookie HTTP-only

### Perfil
- nome
- email
- sexo
- data de nascimento opcional
- avatar/foto de perfil

### Histórico corporal
- peso
- altura
- idade
- percentual de gordura
- data do registro

### Calculadora de percentual de gordura
- módulo para estimativa de percentual de gordura pela fórmula da Marinha dos EUA
- fluxo pensado para homens e mulheres
- uso de medidas corporais para gerar uma estimativa inicial
- objetivo: ajudar quem ainda não sabe o próprio percentual de gordura
- observação no produto de que se trata de uma estimativa, com margem de variação
- possibilidade de salvar o valor estimado como ponto de partida no histórico corporal

### Evolução
- gráfico de peso
- gráfico de percentual de gordura
- visão de histórico por período

### Histórico do sistema
- dietas geradas
- relatórios gerados
- snapshots dos dados corporais usados em cada dieta

## Estrutura sugerida de dados

### User
- id
- nome
- email
- senhaHash opcional
- googleId opcional
- avatarUrl opcional
- createdAt
- updatedAt

### UserSession ou RefreshToken
- id
- userId
- token
- expiresAt

### UserProfile
- id
- userId
- sexo
- dataNascimento opcional
- alturaAtual
- pesoAtual
- gorduraAtual
- updatedAt

### BodyMetricEntry
- id
- userId
- peso
- altura
- idade
- percentualGordura
- recordedAt
- notes opcional

### Diet
- id
- userId
- objetivo
- metas
- distribuição
- alimentos
- planoGerado
- algoritmoVersao
- createdAt

### DietSnapshot
- id
- dietId
- peso
- altura
- idade
- percentualGordura
- createdAt

### Report
- id
- userId
- dietId
- tipo
- conteudoOuArquivo
- createdAt

### UserPreference
- id
- userId
- configurações de geração
- favoritos
- limites personalizados

## Decisões futuras

- PDF salvo pronto ou regenerado sob demanda
- configurações da engrenagem globais, por usuário ou por dieta
- armazenamento local ou cloud do avatar
- plano gratuito e premium
- histórico corporal manual ou híbrido

## Riscos e cuidados

- compatibilidade com dietas já salvas
- migração do modelo atual de usuário para conta autenticada
- proteção de dados de saúde
- manter o gerador estável enquanto a área de usuário cresce

## Checklist para ambiente externo

Quando formos subir para acesso externo por plataformas como planejamos antes, precisamos revisar estes pontos:

### Autenticação e sessão
- definir `GOOGLE_CLIENT_ID` real do ambiente publicado
- definir `VITE_GOOGLE_CLIENT_ID` real do frontend publicado
- revisar se a autenticação continuará por token em `localStorage` ou migrará para cookie `HTTP-only`
- ativar envio real de email para recuperação de senha
- definir URL pública segura para reset de senha

### Avatar e arquivos
- decidir se o avatar continuará em disco local ou irá para cloud storage
- se ficar externo, usar URL pública estável para o avatar
- validar política de tamanho, tipo de arquivo e limpeza de uploads antigos

### API e frontend publicados
- revisar `CORS` para aceitar apenas domínios oficiais
- definir `FRONTEND_URL` e `VITE_API_URL` de produção
- revisar política de headers `Authorization`
- confirmar que as rotas estáticas de avatar funcionam em domínio público

### Banco e segurança
- revisar constraints e migrações antes de produção
- verificar duplicidade de emails/contas Google em bases antigas
- definir política de logs para dados sensíveis
- revisar proteção de dados de saúde e privacidade

## Ordem prática recomendada

1. autenticação
2. perfil
3. histórico corporal
4. calculadora de percentual de gordura
5. gráfico de evolução
6. vínculo de dietas ao usuário
7. relatórios por usuário
8. dashboard
9. refinamentos de segurança e produto

## Sequência completa de sprints

### Sprint 1: Autenticação
- cadastro com email e senha
- login com email e senha
- login com Google
- logout
- recuperação de senha
- base de sessão/autenticação

### Sprint 2: Perfil
- tela Minha conta
- tela Meu perfil
- edição de nome, email e sexo
- data de nascimento opcional
- upload de avatar/foto
- persistência do avatar

### Sprint 3: Histórico corporal
- cadastro de peso, altura, idade e percentual de gordura
- tabela de registros corporais
- atualização do perfil atual com base no último registro
- vínculo entre perfil e histórico

### Sprint 4: Calculadora de percentual de gordura
- botão `Calcular meu percentual` no perfil ou histórico
- modal ou tela própria da calculadora
- entrada de medidas em cm
- fluxo separado para homem e mulher
- cálculo pela fórmula da Marinha dos EUA
- resultado com aviso de estimativa
- ação `Usar este valor no perfil`
- ação `Salvar no histórico`
- registro com origem `navy_formula`

### Sprint 5: Evolução
- tela Minha evolução
- gráfico de peso
- gráfico de percentual de gordura
- linha do tempo de registros
- filtros por período

### Sprint 6: Dietas do usuário
- vincular dieta ao usuário autenticado
- salvar snapshot corporal junto da dieta
- tela Minhas dietas
- reabrir dieta gerada
- filtros por data, objetivo e calorias

### Sprint 7: Relatórios
- vincular relatório ao usuário
- tela Meus relatórios
- reabrir/baixar relatório
- filtros e organização

### Sprint 8: Dashboard
- home logada com resumo do perfil
- últimas dietas
- últimos relatórios
- resumo da evolução corporal
- botão continuar de onde parei

### Sprint 9: Segurança e refinamento
- controle de acesso
- auditoria básica
- ajustes de privacidade
- revisão de UX
- migração dos dados antigos sem perder compatibilidade

## Observação importante

O motor de dietas já foi bastante refinado. Então a próxima grande entrega estratégica não é refazer o algoritmo do zero, e sim consolidar a camada de usuário e histórico sem perder a inteligência alimentar já construída.
