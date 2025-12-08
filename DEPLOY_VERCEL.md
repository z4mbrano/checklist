# Guia de Deploy no Vercel

Este projeto está configurado para ser implantado no Vercel como um monorepo (Frontend + Backend).

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com).
2. O código deve estar no GitHub.

## Passos para Deploy

1. **Importar Projeto no Vercel:**
   - No dashboard do Vercel, clique em "Add New..." -> "Project".
   - Selecione o repositório do GitHub `checklist`.
   - **Framework Preset:** Deixe como "Other" ou "Vite" (o Vercel deve detectar o `vercel.json` e ajustar, mas se perguntar, o frontend é Vite).
   - **Root Directory:** Deixe como `./` (raiz).

2. **Configurar Variáveis de Ambiente:**
   Adicione as seguintes variáveis nas configurações do projeto no Vercel (Settings -> Environment Variables):

   | Variável | Descrição | Exemplo |
   |----------|-----------|---------|
   | `DB_HOST` | Host do MySQL | `mysql.vrdsolution.com.br` |
   | `DB_USER` | Usuário do MySQL | `vrdsolution01` |
   | `DB_PASSWORD` | Senha do MySQL | `******` |
   | `DB_NAME` | Nome do Banco | `vrdsolution01` |
   | `DB_PORT` | Porta do MySQL | `3306` |
   | `SECRET_KEY` | Chave secreta para JWT | (Gere uma string aleatória segura) |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiração do Token (min) | `60` |
   | `REFRESH_TOKEN_EXPIRE_DAYS` | Expiração do Refresh (dias) | `7` |
   | `ENVIRONMENT` | Ambiente | `production` |
   | `DEBUG` | Modo Debug | `False` |
   | `ALLOWED_ORIGINS` | Origens permitidas (CORS) | `["https://seu-projeto.vercel.app"]` |
   | `UPLOAD_DIR` | Diretório de Uploads (Temp) | `/tmp` (Vercel é read-only, use S3 idealmente) |
   | `MAX_FILE_SIZE` | Tamanho máx arquivo (bytes) | `10485760` |
   | `CELERY_BROKER_URL` | URL do Redis (Opcional) | `redis://...` (Necessário Redis externo) |
   | `CELERY_RESULT_BACKEND` | URL do Redis (Opcional) | `redis://...` |
   | `SMTP_SERVER` | Servidor SMTP (Opcional) | `smtp.gmail.com` |
   | `SMTP_PORT` | Porta SMTP (Opcional) | `587` |
   | `SMTP_USERNAME` | Usuário SMTP (Opcional) | `email@exemplo.com` |
   | `SMTP_PASSWORD` | Senha SMTP (Opcional) | `senha` |
   | `DEFAULT_PAGE_SIZE` | Paginação Padrão | `20` |
   | `MAX_PAGE_SIZE` | Paginação Máxima | `100` |

   *Nota: Ajuste o `ALLOWED_ORIGINS` após o primeiro deploy, quando você tiver a URL final do Vercel.*
   *Nota 2: O Vercel tem sistema de arquivos efêmero (read-only exceto /tmp). Uploads de arquivos não persistirão. Recomenda-se usar AWS S3 ou similar para produção.*

3. **Deploy:**
   - Clique em "Deploy".
   - O Vercel irá construir o Frontend (Vite) e configurar o Backend (Python Serverless Function).

## Estrutura de Deploy

- **Frontend:** Arquivos estáticos servidos na raiz `/`.
- **Backend:** API servida em `/api/...`.
- **Configuração:** O arquivo `vercel.json` na raiz controla o roteamento e o build.

## Solução de Problemas

- **Erro 404 na API:** Verifique se a rota começa com `/api/`. O backend só responde neste caminho.
- **Erro de Banco de Dados:** Verifique se o banco de dados (KingHost) aceita conexões externas. Pode ser necessário liberar o IP do Vercel (o que é difícil pois muda sempre) ou usar um banco de dados na nuvem (PlanetScale, Supabase, etc) ou configurar o banco atual para aceitar `%` (qualquer IP), o que tem riscos de segurança.
