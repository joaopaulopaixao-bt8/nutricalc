# Checklist de validação do gerador

Use este roteiro antes de fechar qualquer mudança que toque alimentos, receitas, filtros, macros, PDF, dietas salvas ou relatórios.

## Preparação

- Rodar backend local
- Rodar frontend local
- Entrar com usuário logado
- Confirmar que o seed atual carregou `18 recipes`
- Testar em desktop
- Testar em mobile ou largura equivalente de celular

## Cenários obrigatórios

### 1. Dieta tradicional com alimentos avulsos

- escolher `Dieta tradicional`
- usar preset equilibrado
- selecionar alimentos avulsos de proteína, carboidrato e gordura
- gerar dieta
- conferir se café, lanches, almoço e jantar usam alimentos coerentes
- abrir listas de substituição de proteína, carboidrato e gordura
- gerar PDF
- reabrir dieta salva em `Minha conta > Minhas dietas`

Resultado esperado:
- dieta gerada sem erro
- carboidratos aparecem normalmente
- substituições respeitam categoria e refeição
- PDF abre
- dieta salva reabre com os mesmos dados

### 2. Dieta tradicional com receita pronta

- escolher `Dieta tradicional`
- selecionar ao menos uma receita pronta
- fixar uma receita em refeição compatível
- gerar dieta
- conferir se a receita aparece como `1 porção`
- conferir se o restante da refeição completa macros sem duplicação ruim
- gerar relatório
- reabrir relatório salvo

Resultado esperado:
- receita fixa entra só em refeição compatível
- macros do dia continuam próximos da meta
- relatório salvo mostra contexto da dieta vinculada

### 3. Carnívora estrita

- escolher `Carnívora estrita`
- conferir que não aparece slider de carboidrato
- conferir que não aparece filtro/lista de carboidratos
- selecionar proteínas, gorduras e receitas compatíveis
- gerar dieta
- abrir resultado
- conferir que não aparece card/lista de carboidratos
- gerar PDF
- reabrir dieta salva

Resultado esperado:
- nenhum alimento `category: carb` aparece
- não aparecem arroz, pão, frutas, aveia, feijão, tubérculos ou massas
- substituições não sugerem carboidratos tradicionais
- dieta salva registra estilo carnívoro

### 4. Carnívora com ovos e laticínios

- escolher `Carnívora com ovos e laticínios`
- conferir que carboidratos tradicionais continuam ocultos
- selecionar ovos, queijos, laticínios compatíveis, carnes e gorduras
- selecionar receita compatível
- gerar dieta
- testar café, lanche, almoço e jantar
- gerar relatório
- reabrir relatório salvo

Resultado esperado:
- ovos e laticínios aparecem quando compatíveis
- carboidratos tradicionais não aparecem
- receitas incompatíveis não aparecem
- relatório mostra estilo alimentar correto

### 5. Filtros da montagem

- testar filtro por categoria
- testar filtro por tipo de refeição
- testar filtro por papel alimentar
- testar filtro de favoritos
- testar filtro de selecionados
- testar filtro de receitas por refeição
- testar filtro de receitas selecionadas
- combinar filtros até gerar lista vazia

Resultado esperado:
- filtros não quebram seleção existente
- lista vazia mostra mensagem clara
- troca de estilo remove seleções incompatíveis
- layout não estoura no mobile

### 6. Dietas salvas

- salvar dietas dos três estilos
- filtrar por estilo alimentar
- filtrar por objetivo
- filtrar por período
- filtrar por número de refeições
- filtrar por uso de receitas
- abrir dieta filtrada
- excluir dieta

Resultado esperado:
- filtros retornam apenas itens compatíveis
- dieta com receita mostra indicador
- exclusão atualiza a lista

### 7. Relatórios salvos

- gerar relatórios para dietas dos três estilos
- filtrar por estilo alimentar
- filtrar por objetivo
- filtrar por período
- filtrar por vínculo com dieta
- abrir relatório salvo
- excluir relatório

Resultado esperado:
- relatório vinculado mostra objetivo, calorias, refeições e estilo da dieta
- relatório com receita mostra indicador
- exclusão atualiza a lista

## Critério de aceite

Uma mudança só deve ser considerada pronta quando:

- build do frontend passa
- backend não apresenta erro de sintaxe
- seed roda quando houver mudança em alimentos/receitas
- todos os cenários afetados acima foram testados
- desktop e mobile foram validados visualmente
- qualquer falha encontrada foi registrada antes da próxima sprint
