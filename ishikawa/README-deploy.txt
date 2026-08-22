ISHIKAWA AI — build estático, pronto para viver DENTRO do repositório do
dashboard Raguife, sem sobrescrever nada que já existe lá.

Como instalar:
1. Copie esta pasta inteira "ishikawa/" (com o arquivo oculto .nojekyll e a
   pasta assets/) para a RAIZ do repositório do dashboard Raguife — ao lado
   do index.html que já existe lá. Não renomeie nem mova o index.html do
   Raguife: ele continua exatamente onde está.

   Estrutura final esperada no repositório:
     seu-repo/
       index.html          <- dashboard Raguife (já existe, intocado)
       ishikawa/            <- pasta nova que você está adicionando
         index.html
         .nojekyll
         assets/

2. Suba para o GitHub:
     git add ishikawa
     git commit -m "Adiciona Ishikawa AI"
     git push

3. Se o repositório já usa GitHub Pages, o Ishikawa AI fica acessível em:
     https://SEU-USUARIO.github.io/NOME-DO-REPO/ishikawa/
   O dashboard Raguife continua em:
     https://SEU-USUARIO.github.io/NOME-DO-REPO/

Por que isso funciona sem ajustes extras:
- Os caminhos dos arquivos (CSS/JS) dentro deste index.html são relativos
  (./assets/...), então funcionam tanto na raiz quanto dentro de /ishikawa/.
- A navegação interna entre as telas usa "hash routing" (#/sessao/...),
  que não depende de configuração nenhuma do servidor — evita qualquer
  conflito com as rotas ou scripts do dashboard Raguife.

Para editar o sistema no futuro, use o projeto-fonte completo (não estes
arquivos prontos) e rode "npm install && npm run build" para gerar uma nova
versão desta pasta.

===============================================================================
IMPORTANTE — PASSO OBRIGATÓRIO ANTES DE USAR COM COLABORADORES REAIS
===============================================================================
Esta versão NÃO tem mais nenhuma sessão/ideia/participante fictício — o app
abre vazio, pronto para uso real. Mas por padrão ele funciona em modo LOCAL:
cada navegador/celular só enxerga os dados salvos nele mesmo. Por isso, uma
ideia enviada por um colaborador escaneando o QR Code NÃO aparece no painel
do facilitador em outro aparelho enquanto esse passo não for feito.

Para corrigir isso (funciona em ~3 minutos, gratuito, sem cartão):
1. Abra o app publicado → menu lateral → "Conexão em Tempo Real"
   (ou acesse direto: .../ishikawa/#/configuracoes-conexao)
2. Siga o passo a passo que já está na própria tela (criar um projeto
   gratuito no Firebase, ativar o Realtime Database, colar as credenciais).
3. Clique "Testar conexão".
4. Clique "① Baixar firebase-config.json" — isso baixa um arquivo pronto.
5. Coloque esse arquivo baixado DENTRO desta pasta "ishikawa/", ao lado do
   index.html (mesmo nível de .nojekyll e assets/):
     ishikawa/
       index.html
       firebase-config.json   <- arquivo que você acabou de baixar
       .nojekyll
       assets/
6. Suba de novo para o GitHub (git add, commit, push).

ATENÇÃO — passo 5 é o que realmente resolve o celular do colaborador. O
botão "② Salvar só neste navegador" (que aparece na mesma tela) conecta
SÓ o computador onde você preencheu o formulário — o celular do colaborador
nunca visitou essa tela, então ele continuaria sem conexão. É o arquivo
firebase-config.json publicado junto com o site (passo 5) que faz QUALQUER
dispositivo que abrir o QR Code conectar automaticamente, sem precisar
passar pela tela de configuração.

A partir do passo 6, todo dispositivo que carregar esta mesma URL passa a
ver os mesmos dados em tempo real — inclusive celulares entrando pelo QR
Code. Sem os passos 4–6, o sistema continua 100% funcional para uso e
testes em um único dispositivo, mas não para colaboração multi-dispositivo.
