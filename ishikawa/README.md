# 🐟 ISHIKAWA AI

Plataforma digital de Brainstorming, Causa-Raiz e Melhoria Contínua para ambientes industriais.

> QR Code → Colaboradores → Parede de Post-its → IA → Agrupamento → Ishikawa → 5 Porquês → Priorização → Pareto → Plano de Ação

Transforma uma reunião tradicional de brainstorming em uma experiência digital, visual e interativa — mantendo a linguagem de uma sala Kaizen (post-its, quadro físico, gestão visual), mas com uma camada de IA que organiza, classifica e sugere causas em tempo real.

---

## 1. Stack técnica

| Camada | Tecnologia | Observação |
|---|---|---|
| UI | React 18 + Vite | SPA, sem SSR |
| Estilo | Tailwind CSS | Design system industrial (ver `tailwind.config.js`) |
| Estado global | Zustand (`persist`) | Substituível por backend real sem reescrever telas |
| Animações | Framer Motion | Drag de post-its, entrada de novas ideias |
| Gráficos | Recharts | Pareto, dashboard |
| QR Code | qrcode.react | Renderização client-side |
| Exportação PDF | jsPDF + html2canvas | Relatório da sessão |
| Roteamento | React Router v6 | Rotas por sessão (`/sessao/:id/...`) |

**Por que essa stack e não outra?** É a combinação com menor atrito para rodar 100% no navegador sem backend (requisito da REGRA 5 do briefing), mas onde cada peça tem um caminho de migração claro para produção (seção 6 abaixo). Zustand foi escolhido no lugar de Redux/Context por ter uma API mínima que não exige refatoração de telas quando os dados passarem a vir de uma API assíncrona — as actions da store já são o único ponto de contato entre UI e dados.

---

### Identidade visual

A paleta e a tipografia seguem o padrão visual **Raguife** (referência fornecida): verde institucional (`#024f2b`/`#013d21` no gradiente de cabeçalho), verde-oliva de destaque (`#739630`), lima para acentos (`#a8d060`), tipografia **Nunito** para textos/títulos e **DM Mono** para códigos, rótulos em caixa alta e indicadores numéricos — o mesmo par de fontes do dashboard de referência. Esses tokens ficam centralizados em `tailwind.config.js` (`colors.brand`, `colors.olive`, `colors.ink`, `colors.steel`, `fontFamily`), então qualquer ajuste de marca é feito em um único arquivo, sem precisar tocar nas telas.

## 2. Como instalar

Pré-requisitos: Node.js 18+ e npm.

```bash
cd ishikawa-ai
npm install
```

## 3. Como executar (desenvolvimento)

```bash
npm run dev
```

Acesse `http://localhost:5173`. O ambiente já inicia com uma sessão de demonstração completa (`BR-2026-0087` — Baixa produtividade da extrusora Linha 04), incluindo 12 ideias, 7 participantes, 3 agrupamentos e 5 causas priorizadas, para que a experiência possa ser avaliada imediatamente.

## 4. Como usar (fluxo funcional)

1. **Dashboard inicial** (`/`) → *Nova sessão* ou *Entrar em sessão* (código, ex: `BR-2026-0087`).
2. **Nova sessão** → preencha problema, setor, equipamento, responsável e objetivo → o sistema gera automaticamente o ID, o código (`BR-YYYY-NNNN`) e o QR Code.
3. **Tela de QR Code** → compartilhe a tela (TV/projetor) ou o link. Cada colaborador escaneia com o celular.
4. **Tela do colaborador** (mobile) → identifica-se pelo nome (sem login) → envia ideias livremente.
5. **Parede de Post-its** (`/sessao/:id/parede`) → o coração do produto:
   - Ideias chegam em tempo real (simulado localmente — ver §5) como post-its com posição orgânica, cor e rotação aleatórias;
   - Arraste qualquer post-it — a posição é salva;
   - Clique em um post-it para editar, reclassificar, investigar similaridade ou excluir;
   - **✨ Organizar com IA** varre a parede inteira e sugere agrupamentos + classificações (o facilitador aplica tudo, revisa uma a uma, ou cancela — a IA nunca decide sozinha);
   - **▶ Simular Brainstorm** injeta ideias fictícias a cada 3–5s, útil para demonstração comercial;
   - **📺 Modo Apresentação** — tela cheia, sem menus, para TVs/projetores em sala de reunião.
6. **🐟 Construir Ishikawa** → converte ideias/grupos aprovados em causas classificadas nas 6 categorias (6M) e navega para o diagrama.
7. **Ishikawa** → clique numa causa para editar, criar subcausa (hierarquia Problema → Causa → Subcausa → Causa raiz), mover categoria ou abrir os 5 Porquês.
8. **5 Porquês** → IA sugere uma cadeia editável de "Por quês"; todas as respostas exigem validação humana antes de confirmar causa raiz.
9. **Votação** → cada participante vota uma única vez por causa (duplicidade bloqueada pela store).
10. **Priorização** → matriz configurável (Impacto × Frequência × Gravidade × Urgência × Custo × Facilidade), com classificação visual 🟢🟡🟠🔴.
11. **Pareto** → gráfico 80/20 sobre os votos das causas.
12. **Plano de Ação** → causa → ação → responsável → prazo → status (aberto/andamento/concluído/atrasado/cancelado).
13. **Dashboard** → visão consolidada da sessão (participantes, categorias, top causas, status do plano de ação).
14. **Relatório** → documento único com todas as seções, exportável em PDF ou impressão.
15. **Histórico** → reabrir sessões anteriores.
16. **Configurações da IA** → thresholds de similaridade/confiança, categorias ativas, número de sugestões, toggles de automação.

---

## 5. Arquitetura

```
src/
  components/
    layout/        → FacilitatorLayout (sidebar + topo com contadores ao vivo)
    ui/             → Button, Card, StatBadge, CategoryBadge, ToastStack (design system)
    wall/           → PostIt, GroupCluster, IdeaDetailPanel, SimilarityAlert, AIOrganizeModal, FilterBar
    ishikawa/       → CauseNode (árvore recursiva), CauseDetailPanel
  pages/            → 1 arquivo por tela (ver seção 3 do briefing original)
  services/
    AIService.js    → ÚNICA camada que "sabe IA" — MOCK hoje, plugável amanhã (ver §6)
    ExportService.js→ Exportação de relatório em PDF
  store/
    useAppStore.js  → Estado global (Zustand) — sessão, ideias, grupos, causas, votos, ações, config de IA
  data/
    mockData.js     → Seed de demonstração — espelha o schema de banco de dados (ver §7)
  utils/helpers.js  → IDs, datas, posicionamento orgânico, categorias 6M
```

**Regra de arquitetura**: nenhuma tela chama `Math.random()`, heurísticas de texto ou lógica de "inteligência" diretamente — tudo passa pelo `AIService`. Isso significa que trocar o motor de IA é uma mudança em **um único arquivo**, sem tocar em nenhuma página.

### Regras de negócio implementadas (nível de aplicação, não apenas de interface)

- A IA **nunca** exclui ou funde ideias automaticamente — sempre pede confirmação (`SimilarityAlert`, `AIOrganizeModal`).
- Um participante não pode votar duas vezes na mesma causa (`hasVoted` / `castVote` na store).
- Post-its agrupados desaparecem da visão "solta" da parede e passam a existir só dentro do cluster — evita contagem duplicada.
- A posição de cada post-it é persistida (drag-and-drop), inclusive entre sessões do navegador (via `localStorage`, ver §7).

---

## 6. Como conectar uma IA real

Hoje o `src/services/AIService.js` opera em **modo MOCK**: classificação por palavras-chave (dicionário 6M) e similaridade por Jaccard + sinônimos. Para plugar uma IA real (ex: Claude, GPT, um modelo interno):

1. Mantenha as assinaturas de função exatamente como estão (`analyzeIdea`, `findSimilarIdeas`, `classifyIshikawaCategory`, `suggestGrouping`, `suggestFiveWhys`, `suggestRootCause`, `suggestActions`, `analyzeWall`).
2. Substitua o corpo de cada função por uma chamada HTTP à sua API (ex: `fetch('/api/ai/classify', ...)`), mantendo o mesmo formato de retorno (`{ category, confidence }`, etc.).
3. Para similaridade semântica de verdade, troque `calculateSimilarity` (hoje Jaccard léxico) por comparação de **embeddings** (cosine similarity) — é o ponto exato onde a precisão do MOCK é mais limitada.
4. Nenhuma tela precisa ser alterada — todas consomem o `AIService` por import direto.

⚠️ Chame a API de IA **a partir de um backend**, nunca do frontend diretamente, para não expor chaves de API no navegador (ver §8 sobre produção).

---

## 7. Como conectar um banco de dados

A store (`useAppStore.js`) já usa `persist` (localStorage) como um banco "fake" para a demonstração funcionar offline. O schema abaixo é o contrato de dados esperado — implemente-o em **Firestore**, **Supabase** ou qualquer banco relacional:

```
users(id, name, sector, role)
sessions(id, title, problem, sector, equipment, responsible, status, created_at)
ideas(id, session_id, user_id, text, category, confidence, type, x, y, rotation, color, created_at)
idea_groups(id, session_id, title, created_at)
group_members(group_id, idea_id)
causes(id, session_id, parent_id, category, title, type)
votes(id, session_id, cause_id, user_id)
five_whys(id, cause_id, why_number, answer)
actions(id, session_id, cause_id, description, responsible, deadline, priority, status, evidence)
```

Passos recomendados de migração:

1. Trocar cada `set(...)` da store por uma escrita no banco (ex: `await db.collection('ideas').add(idea)`), mantendo o mesmo *shape* de objeto.
2. Trocar as leituras iniciais (`DEMO_*` de `mockData.js`) por queries reais filtradas por `session_id`.
3. Remover o `persist` do Zustand (ou mantê-lo só como cache otimista) — o banco passa a ser a fonte da verdade.

## 8. Tempo real

Fluxo alvo em produção:

```
Celular do colaborador → Banco de dados → IA → Painel do facilitador → Post-it aparece na parede
```

Hoje isso é **simulado no cliente** (mesma aba/`localStorage` compartilhado + botão "Simular Brainstorm"). Para tempo real de verdade entre dispositivos diferentes:

- **Firebase**: use `onSnapshot` no Firestore, ou `Realtime Database` com listeners `on('value')`, na coleção `ideas` filtrada por `session_id`. Substitua o array `ideas` da store por esse listener.
- **Supabase**: use `supabase.channel(...).on('postgres_changes', ...)` sobre a tabela `ideas`.
- Em ambos os casos, a UI não muda — ela já reage a mudanças no array `ideas` da store; só a *fonte* desse array muda de `useState`/`persist` para uma subscription.

## 9. Publicar no GitHub Pages (HTML estático pronto para subir)

O projeto já vem configurado para isso:

- `vite.config.js` usa `base: './'` (caminhos relativos) — os assets carregam corretamente mesmo servidos de um subcaminho de projeto (`usuario.github.io/repo/`).
- O roteamento usa `HashRouter` (`#/sessao/:id/parede`) em vez de `BrowserRouter` — necessário porque o GitHub Pages não tem *rewrite* de servidor para SPA; sem isso, atualizar a página em qualquer rota que não seja `/` resultaria em 404.

Passos:

1. Gere o build estático:
   ```bash
   npm run build
   ```
   Isso cria a pasta `dist/` — um conjunto de arquivos HTML/CSS/JS estáticos, sem dependência de Node em produção.
2. Crie um repositório no GitHub e suba o **conteúdo** de `dist/` (não a pasta em si) na raiz do repositório, ou na branch `gh-pages`.
3. Em *Settings → Pages*, selecione a branch/pasta publicada.
4. Acesse `https://usuario.github.io/nome-do-repo/` — a aplicação carrega e todas as rotas internas funcionam via hash (`#/...`).

Alternativa recomendada para manter tudo versionado num único repositório: subir o **código-fonte completo** (este projeto) e configurar uma GitHub Action que roda `npm install && npm run build` e publica `dist/` automaticamente a cada push (fluxo `actions/deploy-pages`). Isso evita ter que gerar e subir o build manualmente a cada alteração.

## 10. Colocar em produção

1. `npm run build` gera os arquivos estáticos em `dist/`.
2. Hospede `dist/` em qualquer CDN/host estático (Vercel, Netlify, Firebase Hosting, S3+CloudFront).
3. Se for conectar banco de dados e IA real, crie um backend leve (Cloud Functions, uma API Node/Express, ou Supabase Edge Functions) para:
   - Autenticação de facilitadores (o colaborador continua sem login, por design);
   - Proxy das chamadas de IA (não expor chaves no cliente);
   - Regras de acesso por sessão/empresa.
4. Ajuste `window.location.origin` (usado para montar o link do QR Code em `QRCodePage.jsx`) para o domínio de produção — hoje ele já resolve automaticamente pelo host atual, sem hardcode.

---

## 11. Dados de demonstração

O sistema inicia com uma sessão fictícia completa (`src/data/mockData.js`): 12 ideias, 7 participantes, 6 categorias, 3 agrupamentos e 5 causas priorizadas, sobre o problema "Baixa produtividade da extrusora Linha 04" — pronto para demonstração comercial imediata, sem necessidade de setup.

## 12. Limitações conhecidas do MOCK (leia antes de apresentar a um cliente)

Como analista crítico do próprio produto, vale registrar honestamente onde o MOCK atual é frágil, para não gerar expectativa equivocada em uma demonstração comercial:

- **Classificação por palavras-chave**: textos fora do dicionário 6M caem em um fallback de baixa confiança (~45%) distribuído por hash — funciona bem para os termos de manufatura comuns do exemplo, mas não generaliza para vocabulário fora desse domínio sem expandir o dicionário ou trocar por um modelo real.
- **Similaridade léxica (Jaccard)**: não captura sinônimos fora da lista `SYNONYM_GROUPS` nem paráfrases distantes — duas ideias com mesmo sentido mas vocabulário muito diferente podem não ser agrupadas. Um modelo de embeddings resolve isso diretamente (ver §6).
- **Persistência via `localStorage`**: cada navegador/dispositivo tem sua própria cópia dos dados — por isso a "colaboração em tempo real" hoje só funciona dentro da mesma aba/sessão de navegador simulando múltiplos usuários. Para colaboração real entre celular e painel do facilitador, é indispensável concluir a migração do §8 antes de qualquer uso em campo.
- **Sem autenticação**: qualquer pessoa com o link pode agir como facilitador. Aceitável para uma demonstração; **não** aceitável para uso operacional real sem uma camada de autenticação/autorização.
