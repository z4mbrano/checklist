"""
ARQUITETURA HEXAGONAL (CLEAN ARCHITECTURE)
===========================================

Demonstração de que Domain está completamente isolado de Infra.

Camadas da Aplicação (De dentro para fora):
┌─────────────────────────────────────────────────────────────────┐
│                    1. DOMAIN LAYER (Core)                       │
│  📦 app/domain/entities/project.py                              │
│  - Project (dataclass pura, zero dependências externas)         │
│  - Business Rules: validações, transições de estado             │
│  - ZERO conhecimento sobre banco, HTTP, frameworks              │
│                                                                  │
│  📦 app/domain/repositories/project_repository.py (INTERFACE)   │
│  - IProjectRepository (ABC/Protocol)                            │
│  - Define CONTRATO sem implementação                            │
│  - Domain dita regras, infra obedece                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Dependency Direction
┌─────────────────────────────────────────────────────────────────┐
│              2. APPLICATION LAYER (Use Cases)                   │
│  📦 app/services/project_service.py                             │
│  - ProjectService (orquestração de casos de uso)                │
│  - Depende de IProjectRepository (abstração)                    │
│  - NÃO conhece SQLAlchemy, FastAPI, etc                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            3. INFRASTRUCTURE LAYER (Adapters)                   │
│  📦 app/infrastructure/repositories/                            │
│     sqlalchemy_project_repository.py                            │
│  - SQLAlchemyProjectRepository implements IProjectRepository    │
│  - TRANSLATION LAYER (Mappers):                                 │
│    * _to_domain(ORMProject) -> Project                          │
│    * _to_orm(Project) -> ORMProject                             │
│  - ÚNICO lugar que conhece SQLAlchemy                           │
│                                                                  │
│  📦 app/models/project.py (ORM Models)                          │
│  - ORMProject (SQLAlchemy declarative)                          │
│  - Tabelas, colunas, relacionamentos                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          4. PRESENTATION LAYER (Interface Adapters)             │
│  📦 app/api/v1/projects.py (Controllers)                        │
│  - HTTP endpoints (FastAPI)                                     │
│  - Conversão Request → DTO → Domain                             │
│  - Conversão Domain → DTO → Response                            │
│  - Dependency Injection via FastAPI Depends()                   │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════
FLUXO DE DADOS (Exemplo: Criar Projeto)
═══════════════════════════════════════════════════════════════════

1. HTTP Request (JSON)
   POST /api/v1/projects/
   {
     "name": "Website Rebuild",
     "client_id": 5,
     "start_date": "2025-12-01"
   }
   
2. Controller (projects.py)
   - Valida request → ProjectCreateRequest (Pydantic DTO)
   - Injeta ProjectService via DI
   - Chama: service.create_project(name, client_id, ...)

3. Service Layer (project_service.py)
   - Aplica regras de negócio
   - Cria domain entity: Project(name="Website Rebuild", ...)
   - Chama: repository.save(project)  # ← Interface, não implementação!

4. Repository (sqlalchemy_project_repository.py)
   ┌──────────────────────────────────────────────────────────┐
   │ TRANSLATION LAYER (Mapper)                               │
   │                                                           │
   │ def _to_orm(domain_project: Project) -> ORMProject:      │
   │     return ORMProject(                                    │
   │         nome=domain_project.name,        # ← Mapeamento  │
   │         cliente_id=domain_project.client_id,             │
   │         ...                                               │
   │     )                                                     │
   └──────────────────────────────────────────────────────────┘
   - Converte Project → ORMProject
   - Executa: session.add(orm_project); session.commit()
   - Converte de volta: ORMProject → Project (com ID gerado)

5. Retorno (caminho inverso)
   Repository → Service → Controller
   - Service retorna: Project (domain entity)
   - Controller converte: Project → ProjectResponse (DTO)
   - FastAPI serializa: ProjectResponse → JSON

═══════════════════════════════════════════════════════════════════
PROVA DE ISOLAMENTO
═══════════════════════════════════════════════════════════════════

Teste 1: Domain sem Infra
>>> from app.domain.entities.project import Project, ProjectStatus
>>> project = Project(
...     name="Test",
...     client_id=1,
...     responsible_user_id=1,
...     start_date=date.today()
... )
>>> project.start()  # ← Business logic funciona sem banco!
>>> print(project.status)
ProjectStatus.EM_ANDAMENTO

Teste 2: Trocar SQLAlchemy por MongoDB (hipotético)
1. Criar MongoProjectRepository implements IProjectRepository
2. Implementar _to_domain() e _to_mongo()
3. Trocar injeção de dependência em dependencies.py
4. Domain e Service NÃO MUDAM UMA LINHA!

═══════════════════════════════════════════════════════════════════
BENEFÍCIOS DESTA ARQUITETURA
═══════════════════════════════════════════════════════════════════

✅ Testabilidade
   - Domain testável sem banco (unit tests puros)
   - Service testável com mock repositories
   - Infra testável isoladamente

✅ Flexibilidade
   - Trocar banco: apenas muda repository implementation
   - Adicionar GraphQL: nova presentation layer, mesmo domain
   - Adicionar cache: decorator no repository, domain intocado

✅ Manutenibilidade
   - Business rules centralizadas no domain
   - Fácil localizar bugs (cada camada tem responsabilidade clara)
   - Novos devs entendem fluxo rapidamente

✅ Escalabilidade
   - Domain pode virar microservice separado
   - Repository pode adicionar sharding sem afetar domain
   - Cache/CQRS adicionável sem refatoração massiva

═══════════════════════════════════════════════════════════════════
DEPENDENCY RULE (Regra de Ouro)
═══════════════════════════════════════════════════════════════════

Dependências sempre apontam PARA DENTRO (toward domain):

  Presentation → Application → Domain
     ↓              ↓             ↑
  Infrastructure ←──┘             │
     (adapta-se ao domain)        │
                                  │
Domain NUNCA depende de camadas externas!

Violações comuns (EVITADAS neste projeto):
❌ Domain importando SQLAlchemy models
❌ Domain importando FastAPI Request/Response
❌ Service conhecendo detalhes de persistência
❌ Controller contendo business logic

✅ Implementações corretas (FEITAS neste projeto):
✅ Domain define IProjectRepository (interface)
✅ Infrastructure implementa IProjectRepository
✅ Service depende de IProjectRepository (abstração)
✅ DI injeta SQLAlchemyProjectRepository em runtime
"""
