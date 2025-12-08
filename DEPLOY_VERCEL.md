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
   | `ENVIRONMENT` | Ambiente | `production` |
   | `ALLOWED_ORIGINS` | Origens permitidas (CORS) | `["https://seu-projeto.vercel.app"]` |

   *Nota: Ajuste o `ALLOWED_ORIGINS` após o primeiro deploy, quando você tiver a URL final do Vercel.*

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
