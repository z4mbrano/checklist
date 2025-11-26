# 🚑 Correção de Emergência (Erro 500) - Versão 2

Os erros que você relatou indicam dois problemas principais:
1.  **Frontend**: O arquivo `.htaccess` estava configurado para a raiz (`/`), mas o site está em `/checklist/`.
2.  **Backend**: O arquivo `.htaccess` do backend está conflitando com o servidor e causando um loop de erro (por isso a mensagem "Additionally, a 500...").

Siga estes passos EXATAMENTE nesta ordem:

## PARTE 1: FRONTEND (Corrigir Tela Branca/Erro 500)

1.  **Já corrigi o arquivo**: Atualizei o arquivo `frontend/public/.htaccess` para funcionar na pasta `/checklist/`.
2.  **Reconstruir**:
    Abra o terminal na pasta `frontend` e execute:
    ```powershell
    npm run build
    ```
3.  **Limpar Servidor**:
    *   No FTP, entre na pasta `/www/checklist`.
    *   **APAGUE TUDO** que estiver lá dentro (para garantir que não sobrem arquivos velhos).
4.  **Upload**:
    *   Envie todo o conteúdo da pasta `frontend/dist` (do seu computador) para `/www/checklist` (no FTP).

## PARTE 2: BACKEND (Corrigir Erro 500 Persistente)

O erro "Additionally, a 500 Internal Server Error..." acontece porque o servidor tenta mostrar uma página de erro customizada que não existe ou está mal configurada no `.htaccess`.

1.  **APAGAR .htaccess**:
    *   No FTP, vá na pasta do backend (`/apps_wsgi/checklist` ou onde você colocou o Python).
    *   **APAGUE** o arquivo `.htaccess` que está lá.
    *   *Motivo*: O Passenger da KingHost já gerencia isso. O arquivo que você tinha estava com caminhos errados (`/home/vrdsolution/www/...`) que causavam o crash.

2.  **Corrigir Quebra de Linha (CRLF vs LF)**:
    Arquivos editados no Windows podem ter quebras de linha que o Linux não entende, causando Erro 500 imediato.
    Execute este comando no seu PowerShell (na raiz do projeto) para corrigir o arquivo `passenger_wsgi.py`:

    ```powershell
    $path = "backend\passenger_wsgi.py"
    $text = [IO.File]::ReadAllText($path) -replace "`r`n", "`n"
    [IO.File]::WriteAllText($path, $text)
    Write-Host "Arquivo convertido para LF com sucesso!"
    ```

3.  **Upload do Script de Diagnóstico**:
    *   Envie o arquivo `backend/passenger_wsgi.py` (que acabamos de corrigir) para a pasta do backend no FTP.

4.  **Testar**:
    *   Acesse `https://checklist.vrdsolution.com.br/`
    *   Se ainda der erro 500, verifique se apareceu o arquivo `startup_error.txt` no FTP.

## Resumo
*   Frontend: `npm run build` -> Upload `dist` -> `/www/checklist`
*   Backend: **Apagar** `.htaccess` do servidor -> Converter `passenger_wsgi.py` para LF -> Upload.
