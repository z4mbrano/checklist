# 🔒 RECOMENDAÇÕES CRÍTICAS DE SEGURANÇA

## ⚠️ PRIORIDADE MÁXIMA - IMPLEMENTAR IMEDIATAMENTE

### 1. **MIGRAÇÃO DE ARMAZENAMENTO DE TOKENS** 
**Status**: ❌ NÃO IMPLEMENTADO (Requer mudança de arquitetura)  
**Risco**: CRÍTICO - OWASP A02:2021

**Problema Atual:**
```typescript
// ❌ VULNERÁVEL - localStorage acessível via JavaScript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({ /* ... */ }),
    { name: 'auth-storage' } // Armazena em localStorage
  )
)
```

**Solução Recomendada:**
```typescript
// ✅ SEGURO - HttpOnly Cookies (inacessível via JavaScript)
// Backend deve retornar Set-Cookie em vez de JSON

// FastAPI:
@router.post("/login")
async def login(response: Response):
    # Gerar token
    access_token = create_access_token(...)
    
    # Set HttpOnly Cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,      # ✅ Previne XSS
        secure=True,        # ✅ Apenas HTTPS
        samesite="strict",  # ✅ Previne CSRF
        max_age=3600
    )
    
    return {"user": user_data}  # SEM token no body
```

**Frontend:**
```typescript
// Remover Zustand persist
// Axios automaticamente envia cookies
api.defaults.withCredentials = true
```

---

### 2. **CONTROLE DE ACESSO EM TODAS AS ROTAS**
**Status**: ✅ PARCIALMENTE CORRIGIDO

**Rotas que necessitam revisão:**
- ✅ `DELETE /projects/{id}` - CORRIGIDO (verificação de owner/admin)
- ⚠️ `PUT /projects/{id}` - Qualquer usuário pode editar qualquer projeto
- ⚠️ `POST /checkins/` - Falta validação de projeto ownership
- ⚠️ `DELETE /checkins/{id}` - Sem verificação de propriedade

**Template de Autorização:**
```python
# backend/app/api/v1/projects.py
@router.put("/{project_id}")
async def update_project(
    project_id: int,
    request: ProjectUpdateRequest,
    service: ProjectService = Depends(get_project_service),
    current_user: User = Depends(get_current_active_user)
):
    project = service.get_project(project_id)
    
    # ✅ Autorização
    if not (current_user.is_admin or project.responsible_user_id == current_user.id):
        raise HTTPException(403, "Sem permissão para editar este projeto")
    
    # Processa update...
```

---

### 3. **RATE LIMITING** 
**Status**: ❌ NÃO IMPLEMENTADO

**Instalar middleware:**
```bash
pip install slowapi
```

**Backend:**
```python
# backend/app/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Em rotas sensíveis:
@router.post("/login")
@limiter.limit("5/minute")  # ✅ Máx 5 tentativas/min
async def login(request: Request, ...):
    # ...
```

---

### 4. **CSRF PROTECTION**
**Status**: ❌ NÃO IMPLEMENTADO

**Após migrar para HttpOnly Cookies:**
```python
# backend/app/main.py
from fastapi_csrf_protect import CsrfProtect

@app.exception_handler(CsrfProtectError)
async def csrf_protect_exception_handler(request: Request, exc: CsrfProtectError):
    return JSONResponse(status_code=exc.status_code, content={'detail': exc.message})

# Em formulários:
@router.post("/create-project")
async def create_project(
    request: Request,
    csrf_protect: CsrfProtect = Depends()
):
    await csrf_protect.validate_csrf(request)
    # ...
```

---

### 5. **INPUT VALIDATION RIGOROSA**
**Status**: ⚠️ PARCIAL (Pydantic valida tipo, mas não regras de negócio)

**Melhorias:**
```python
# backend/app/schemas/project.py
from pydantic import Field, validator

class ProjectCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=200, strip_whitespace=True)
    description: Optional[str] = Field(None, max_length=5000)
    
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Nome não pode ser vazio')
        # ✅ Sanitização básica
        if any(char in v for char in ['<', '>', '"', "'"]):
            raise ValueError('Caracteres especiais não permitidos')
        return v
```

---

## 📊 ANÁLISE DE IMPACTO

| Vulnerabilidade | CVSS Score | Esforço | Impacto | Prioridade |
|-----------------|------------|---------|---------|------------|
| localStorage XSS | 8.1 (High) | Alto | Crítico | P0 🔴 |
| Broken Access Control | 7.5 (High) | Médio | Alto | P0 🔴 |
| Falta Rate Limiting | 5.3 (Medium) | Baixo | Médio | P1 🟡 |
| CSRF | 6.5 (Medium) | Médio | Médio | P1 🟡 |
| Input Injection | 7.2 (High) | Baixo | Alto | P1 🟡 |

---

## ✅ CORREÇÕES JÁ IMPLEMENTADAS

1. **Camada de Mappers** - Isolamento de lógica de transformação
2. **Logger centralizado** - Sanitização de dados sensíveis
3. **Error Boundary** - Proteção contra crashes e vazamento de stack traces
4. **Controle de acesso em DELETE** - Verificação de ownership
5. **Hard Delete com confirmação** - Prevenção de exclusão acidental

---

## 🎯 PRÓXIMOS PASSOS (Ordem de Prioridade)

### Semana 1 (Crítico)
- [ ] Migrar autenticação para HttpOnly Cookies
- [ ] Adicionar RBAC completo em todas as rotas de mutação
- [ ] Implementar Rate Limiting em login/registro

### Semana 2 (Alto)
- [ ] Adicionar CSRF Protection
- [ ] Implementar React Query (eliminar cache manual)
- [ ] Adicionar validadores Pydantic rigorosos

### Semana 3 (Médio)
- [ ] Implementar paginação cursor-based no frontend
- [ ] Adicionar testes de segurança automatizados
- [ ] Configurar Content Security Policy (CSP)

---

## 📚 REFERÊNCIAS

- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
