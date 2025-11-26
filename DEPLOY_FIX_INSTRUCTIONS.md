# 🛠️ Instruções de Correção de Deploy

Detectei que você está tendo problemas com erro 500 e configuração de caminhos. Preparei os arquivos para corrigir isso.

## 1. Corrigindo o Backend (Erro 500)

O arquivo `backend/passenger_wsgi.py` foi atualizado com um script de diagnóstico robusto.

1.  **Upload**: Envie o arquivo `backend/passenger_wsgi.py` atualizado para a pasta `/apps_wsgi/checklist` no seu FTP.
2.  **Teste**: Acesse `https://checklist.vrdsolution.com.br/` (ou a URL que aponta para o app Python).
3.  **Resultado**:
    *   **Se aparecer "Hello World..."**: O Python está funcionando! Podemos prosseguir para configurar a aplicação real.
    *   **Se der Erro 500**: Verifique se foi criado um arquivo `startup_error.txt` na pasta `/apps_wsgi/checklist` e me mande o conteúdo.

## 2. Corrigindo o Frontend (Caminho /checklist/)

Você mencionou a URL `https://www.vrdsolution.com.br/checklist/`. Para isso funcionar, o frontend precisa saber que está rodando nessa subpasta.

1.  **Configuração**: Já ajustei o arquivo `frontend/vite.config.ts` adicionando `base: '/checklist/'`.
2.  **Build**:
    *   Abra o terminal na pasta `frontend`.
    *   Execute: `npm run build`
3.  **Upload**:
    *   Pegue todo o conteúdo da pasta `frontend/dist` (que foi gerada pelo build).
    *   Envie para a pasta `/www/checklist` no seu FTP.
    *   **Importante**: Se a pasta `/www/checklist` não existir, crie-a. Se `vrdsolution.com.br` aponta para `/www`, então `/www/checklist` será acessível em `vrdsolution.com.br/checklist/`.

## 3. Próximos Passos (Após o Hello World funcionar)

Quando o "Hello World" do passo 1 funcionar, precisaremos configurar o `passenger_wsgi.py` para carregar sua aplicação FastAPI real.

O código correto para produção será algo assim (não use ainda, primeiro garanta que o Hello World funciona):

```python
import sys, os

# Caminho do ambiente virtual (CONFIRME ESTE CAMINHO NO SEU SERVIDOR)
INTERP = "/home/vrdsolution/.local/share/virtualenvs/checklist/bin/python"

if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

sys.path.append(os.getcwd())
from app.main import app as application
```

Mas primeiro, vamos garantir que o básico funciona!
