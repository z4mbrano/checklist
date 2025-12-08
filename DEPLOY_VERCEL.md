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

## Estrutura de Deploy (Atualizada)

- **Frontend:** O Vercel detecta automaticamente o Vite na raiz (ou na pasta frontend se configurado).
- **Backend:** A pasta `/api` contém o ponto de entrada `index.py` que o Vercel reconhece automaticamente como Serverless Function.
- **Configuração:** O arquivo `vercel.json` agora usa `rewrites` para direcionar o tráfego.

## Solução de Problemas

- **Erro 404 na API:** O backend agora responde em `/api/...`.
- **Erro 404 no Frontend:** Se o frontend não carregar, verifique se o "Output Directory" nas configurações do Vercel está definido como `frontend/dist` (já que o `package.json` está dentro de `frontend`).

**Importante:** Nas configurações do projeto no Vercel (Settings -> General):
- **Root Directory:** `frontend` (Isso fará o Vercel focar no React).
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

*Mas espere!* Se mudarmos o Root Directory para `frontend`, o Vercel não verá a pasta `api` na raiz.
**A melhor abordagem para Monorepo no Vercel:**
1. Mantenha o **Root Directory** como `./` (raiz do repo).
2. **Build Command:** `cd frontend && npm install && npm run build`
3. **Output Directory:** `frontend/dist`
4. **Install Command:** `echo 'Skipping install at root'` (ou instale dependências globais se precisar).

O `vercel.json` na raiz cuidará de servir o `frontend/dist` para as rotas do site e a pasta `api` para o backend.
