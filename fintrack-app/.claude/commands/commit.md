Faça um commit de todas as mudanças pendentes e depois push para o GitHub.

Siga estes passos em ordem:

1. Execute `git status` para ver arquivos modificados e não rastreados.
2. Execute `git diff --stat` para ver o resumo das mudanças.
3. Execute `git log --oneline -3` para ver o estilo dos commits recentes e manter consistência.
4. Analise as mudanças e escreva uma mensagem de commit clara e concisa:
   - Use prefixo semântico: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
   - Primeira linha: máximo 72 caracteres, descreve O QUÊ foi feito
   - Foque no "porquê" quando relevante
   - Nunca commitar arquivos com secrets (.env, credenciais)
5. Execute `git add` nos arquivos relevantes (evite `git add .` se houver arquivos sensíveis).
6. Crie o commit com a mensagem usando HEREDOC para formatação correta.
7. Execute `git push origin main` para enviar ao GitHub.
8. Confirme o sucesso mostrando o hash do commit e a URL do repositório.

Sempre inclua no final da mensagem de commit:
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
