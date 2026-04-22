# Deploy Online NutriCalc

## Stack escolhida

- Banco: Supabase
- Backend: Render
- Frontend: Vercel

## 1. Variáveis do backend no Render

Crie um novo serviço Web no Render apontando para este repositório e use a pasta `backend`.

Defina estas variáveis:

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

Notas:

- `DATABASE_URL` deve ser a connection string do Supabase em modo pooled ou direct, conforme o ambiente de vocês.
- `FRONTEND_URL` deve ser a URL final publicada na Vercel.
- `GOOGLE_CLIENT_ID` pode ficar vazio no primeiro deploy se vocês ainda não forem ativar o login Google.
- `RESET_PASSWORD_URL` pode ser a mesma URL pública do frontend.
- `RESEND_FROM_EMAIL` precisa ser um remetente válido configurado no Resend.
- `SUPABASE_SERVICE_ROLE_KEY` deve ficar somente no backend/Render.
- `SUPABASE_AVATAR_BUCKET` pode ser `avatars`.

Build command sugerido:

```bash
npm install && npx prisma generate && npx prisma db push && node src/seed.js
```

Start command:

```bash
npm start
```

## 2. Variáveis do frontend na Vercel

No projeto da Vercel, usando a pasta `frontend`, configure:

- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

Exemplo:

```bash
VITE_API_URL=https://seu-backend.onrender.com
```

## 3. Ordem recomendada

1. Publicar backend no Render
2. Confirmar que a URL do backend responde em `/`
3. Publicar frontend na Vercel
4. Atualizar `FRONTEND_URL` no Render com a URL final da Vercel
5. Fazer um redeploy do backend

## 4. Checklist mínimo após publicar

- Abrir o frontend online
- Testar cadastro e login por email/senha
- Gerar dieta
- Salvar relatório
- Excluir dieta, relatório e registro corporal
- Validar se o avatar carrega
- Executar o checklist do gerador em [docs/VALIDATION_CHECKLIST.md](/c:/NutriCalc/docs/VALIDATION_CHECKLIST.md)
- Executar o checklist de produção em [docs/PRODUCTION_CHECKLIST.md](/c:/NutriCalc/docs/PRODUCTION_CHECKLIST.md)

## 5. Pontos ainda pendentes para produção mais sólida

- trocar autenticação de `localStorage` para cookie `HTTP-only`
- configurar envio real de email para reset de senha
- validar Supabase Storage de avatar no ambiente publicado
- configurar domínio real no Google Login

## 6. Roteiros completos

- Validação funcional do gerador: [docs/VALIDATION_CHECKLIST.md](/c:/NutriCalc/docs/VALIDATION_CHECKLIST.md)
- Produção e segurança: [docs/PRODUCTION_CHECKLIST.md](/c:/NutriCalc/docs/PRODUCTION_CHECKLIST.md)
