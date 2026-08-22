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
