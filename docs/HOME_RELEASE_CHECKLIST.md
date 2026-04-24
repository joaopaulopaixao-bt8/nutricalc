# Sprint 8 - Checklist final da home pública

Data: 24/04/2026

## Objetivo

Fechar a nova home pública do NutriCalc com uma régua prática de validação antes de considerar a frente concluída.

## Checklist de aceite

### 1. Entrada e percepção de velocidade

- a landing aparece imediatamente ao abrir o domínio
- não existe splash de tela inteira bloqueando a leitura da home
- se a sessão estiver sendo restaurada, o aviso `Restaurando sessão...` aparece sem travar a navegação
- os passos 1, 2 e 3 do gerador não dependem mais da carga da base alimentar

### 2. Navegação pública

- `#/` abre a landing
- `#/entrar` abre autenticação
- `#/privacidade` abre privacidade
- `#/termos` abre termos
- `#/metodologia` abre metodologia
- o clique no logo do cabeçalho sempre volta para a landing

### 3. Home comercial

- o hero fala de benefício ao usuário, não de bastidor de desenvolvimento
- os textos da primeira dobra estão centrados em dieta, metas, progresso, rotina e organização
- os CTAs principais estão claros:
  - `Começar agora`
  - `Entrar`
  - `Como calculamos`
- não há blocos com linguagem de revisão visual, apresentação de layout ou comentários de implementação

### 4. Imagens e apelo visual

- as imagens carregam corretamente na home publicada
- as imagens ajudam a vender a proposta do produto
- os overlays mantêm contraste suficiente para leitura
- nenhuma imagem quebra o layout em desktop ou mobile

### 5. Branding

- o favicon com `N` verde aparece na aba do navegador
- o título da página foi atualizado
- a descrição do `head` está presente
- a aba do navegador continua identificando claramente o NutriCalc

### 6. Responsividade

- não existe overflow lateral na landing
- os CTAs cabem corretamente em mobile
- os cards não colidem entre si
- os textos das imagens continuam legíveis em telas pequenas
- cabeçalho e rodapé públicos permanecem utilizáveis em celular

### 7. Continuidade para o app autenticado

- login segue funcionando
- após autenticar, a transição para a área logada continua correta
- abrir perfil completo continua funcionando
- abrir a engrenagem continua disparando a carga da configuração do gerador
- avançar até a etapa 4 continua disparando a carga sob demanda da base alimentar

## Conclusão da Sprint 8

A Sprint 8 é considerada concluída quando:

- a home pública estiver validada em desktop e mobile
- a navegação pública estiver consistente
- o favicon estiver aparecendo
- a entrada estiver rápida
- a linguagem da home estiver focada no usuário final
