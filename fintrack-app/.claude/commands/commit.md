Faça commit de todas as mudanças pendentes e push para o GitHub sem fazer perguntas.

Siga estes passos diretamente, sem confirmação:

1. `git status` para ver arquivos modificados.
2. `git diff --stat` para resumo das mudanças.
3. `git log --oneline -3` para consistência de estilo.
4. Analise as mudanças e escreva mensagem de commit semântica (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`).
5. `git add` nos arquivos relevantes (nunca commitar .env ou credenciais).
6. Crie o commit com HEREDOC.
7. `git push origin main` imediatamente.
8. Mostre apenas o hash do commit e confirmação de push.

Regras:
- Não pergunte nada — execute tudo automaticamente
- Não peça confirmação antes do push
- Sempre inclua no final da mensagem:
  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
