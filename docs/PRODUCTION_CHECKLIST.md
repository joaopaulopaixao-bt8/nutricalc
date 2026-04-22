# Checklist de produção e segurança

Use este roteiro antes de publicar ou revisar o NutriCalc em ambiente online real.

## Stack alvo

- Banco: Supabase PostgreSQL
- Storage de avatar: Supabase Storage
- Backend: Render
- Frontend: Vercel

## Variáveis obrigatórias

### Backend

- `DATABASE_URL`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID`
- `RESET_PASSWORD_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_AVATAR_BUCKET`
- `NODE_ENV=production`

### Frontend

- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

## Publicação inicial

1. Criar banco no Supabase
2. Criar ou confirmar bucket público de avatar
3. Configurar variáveis do backend no Render
4. Publicar backend
5. Confirmar backend em `/`
6. Confirmar saúde do avatar em `/api/health/avatar-storage`
7. Confirmar escrita do avatar em `/api/health/avatar-storage/write-check`
8. Configurar variáveis do frontend na Vercel
9. Publicar frontend
10. Atualizar `FRONTEND_URL` no Render com a URL final
11. Fazer redeploy do backend

## Google Login

- Criar OAuth Client no Google Cloud
- Adicionar domínio final do frontend nas origens autorizadas
- Usar o mesmo client id em `GOOGLE_CLIENT_ID` e `VITE_GOOGLE_CLIENT_ID`
- Testar login em aba anônima
- Confirmar se avatar do Google foi importado para Supabase Storage

## Recuperação de senha

- Configurar domínio/remetente no Resend
- Definir `RESEND_API_KEY`
- Definir `RESEND_FROM_EMAIL`
- Definir `RESET_PASSWORD_URL` apontando para o frontend publicado
- Testar solicitação de reset com usuário real
- Testar token inválido e token expirado

## CORS e URLs públicas

- `FRONTEND_URL` deve apontar apenas para o domínio oficial da Vercel ou domínio próprio
- `VITE_API_URL` deve apontar para o backend oficial
- Não deixar domínio local como configuração de produção
- Confirmar que chamadas autenticadas usam o backend correto

## Fluxo funcional obrigatório em produção

- cadastro por email/senha
- login por email/senha
- logout
- recuperação de senha
- login Google, se ativado
- edição de perfil
- upload de avatar
- remoção de avatar
- criação de registro corporal
- calculadora Navy
- geração de dieta tradicional
- geração de dieta carnívora estrita
- geração de dieta carnívora com ovos/laticínios
- seleção e fixação de receita
- geração de relatório
- reabertura de dieta salva
- reabertura de relatório salvo
- exclusão de dieta, relatório e registro corporal

## Segurança e privacidade

- `SUPABASE_SERVICE_ROLE_KEY` deve existir somente no backend
- não expor chaves privadas no frontend
- revisar logs para não registrar senha, token de reset, service role ou dados sensíveis em excesso
- confirmar que dietas e relatórios só abrem para o dono autenticado
- confirmar que exclusões validam `userId`
- revisar se a estratégia atual de token em `localStorage` continuará ou migrará para cookie `HTTP-only`

## Decisão pendente de sessão

Estado atual:
- autenticação usa token no frontend

Decisão futura recomendada:
- avaliar migração para cookie `HTTP-only`, `Secure`, `SameSite=Lax` ou `Strict`
- revisar impacto em CORS, logout, refresh token e deploy Vercel/Render

## Critério de aceite de produção

Produção só deve ser considerada pronta quando:

- frontend publicado acessa apenas backend publicado
- backend publicado acessa banco correto
- avatar persiste após refresh e novo login
- reset de senha envia email real
- Google Login funciona no domínio final ou fica explicitamente desativado
- checklist do gerador foi executado em produção
- mobile foi validado no domínio publicado
