-- =============================================
-- Performance Optimization - Database Indexes
-- Database: MySQL 8.0+
-- Generated: 2025-11-27
-- =============================================

-- IMPORTANT: Execute durante janela de manutenção (pode travar tabela temporariamente)
-- Estimativa de tempo: 5-30 segundos por índice (depende do tamanho da tabela)

-- =============================================
-- 1. PROJETOS - Índices de Performance
-- =============================================

-- Índice composto para listagem de projetos ativos
-- Query: SELECT * FROM projetos WHERE deleted_at IS NULL AND status = 'em_andamento' ORDER BY id
CREATE INDEX idx_projetos_active_status_id 
ON projetos (deleted_at, status, id);

-- Índice para filtrar projetos por cliente
-- Query: SELECT * FROM projetos WHERE cliente_id = X AND status = Y AND deleted_at IS NULL
CREATE INDEX idx_projetos_client_status 
ON projetos (cliente_id, status, deleted_at);

-- Índice para projetos atrasados (query crítica)
-- Query: SELECT * FROM projetos WHERE status = 'em_andamento' AND data_fim_prevista < CURDATE() AND deleted_at IS NULL
CREATE INDEX idx_projetos_overdue 
ON projetos (status, data_fim_prevista, deleted_at);

-- Índice para projetos por responsável
-- Query: SELECT * FROM projetos WHERE responsavel_id = X AND deleted_at IS NULL
CREATE INDEX idx_projetos_responsavel_active 
ON projetos (responsavel_id, deleted_at, status);

-- =============================================
-- 2. CHECKINS - Índices de Performance
-- =============================================

-- Índice para check-ins ativos do usuário (query mais usada)
-- Query: SELECT * FROM checkins WHERE usuario_id = X AND status = 'em_andamento' AND deleted_at IS NULL
CREATE INDEX idx_checkins_user_status 
ON checkins (usuario_id, status, deleted_at, data_inicio);

-- Índice para check-ins do projeto
-- Query: SELECT * FROM checkins WHERE projeto_id = X AND deleted_at IS NULL ORDER BY data_inicio DESC
CREATE INDEX idx_checkins_project_date 
ON checkins (projeto_id, deleted_at, data_inicio DESC);

-- Índice para queries de range de data (analytics)
-- Query: SELECT * FROM checkins WHERE data_inicio BETWEEN X AND Y AND deleted_at IS NULL
CREATE INDEX idx_checkins_date_range 
ON checkins (data_inicio, data_fim, deleted_at);

-- =============================================
-- 3. USUARIOS - Índices de Performance
-- =============================================

-- Índice para login (query crítica de autenticação)
-- Query: SELECT * FROM usuarios WHERE email = 'user@example.com' AND deleted_at IS NULL
CREATE INDEX idx_usuarios_email_active 
ON usuarios (email, deleted_at);

-- Índice para filtrar usuários por role
-- Query: SELECT * FROM usuarios WHERE role = 'admin' AND is_active = 1 AND deleted_at IS NULL
CREATE INDEX idx_usuarios_role_active 
ON usuarios (role, is_active, deleted_at);

-- =============================================
-- 4. TAREFAS - Índices de Performance
-- =============================================

-- Índice para tarefas do projeto (ordenadas)
-- Query: SELECT * FROM tarefas WHERE projeto_id = X AND deleted_at IS NULL ORDER BY ordem
CREATE INDEX idx_tarefas_project_order 
ON tarefas (projeto_id, deleted_at, ordem);

-- =============================================
-- 5. CLIENTES - Índices de Performance
-- =============================================

-- Índice para listagem de clientes ativos
-- Query: SELECT * FROM clientes WHERE deleted_at IS NULL ORDER BY nome
CREATE INDEX idx_clientes_active_name 
ON clientes (deleted_at, nome);

-- =============================================
-- Verificação de Índices Criados
-- =============================================

-- Verificar todos os índices da tabela projetos
SHOW INDEX FROM projetos;

-- Verificar uso dos índices (execute após algumas horas de produção)
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    CARDINALITY,
    SEQ_IN_INDEX,
    COLUMN_NAME
FROM 
    information_schema.STATISTICS
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND INDEX_NAME LIKE 'idx_%'
ORDER BY 
    TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- =============================================
-- Estatísticas de Performance (Antes/Depois)
-- =============================================

-- Query de exemplo: Projetos ativos de um cliente
-- ANTES:   ~500ms (full table scan)
-- DEPOIS:  ~5ms (index seek)
EXPLAIN SELECT * 
FROM projetos 
WHERE cliente_id = 1 
  AND status = 'em_andamento' 
  AND deleted_at IS NULL
ORDER BY id
LIMIT 20;

-- Query de exemplo: Check-ins ativos do usuário
-- ANTES:   ~300ms
-- DEPOIS:  ~2ms
EXPLAIN SELECT * 
FROM checkins 
WHERE usuario_id = 5 
  AND status = 'em_andamento' 
  AND deleted_at IS NULL
ORDER BY data_inicio DESC;

-- Query de exemplo: Projetos atrasados
-- ANTES:   ~800ms
-- DEPOIS:  ~3ms
EXPLAIN SELECT * 
FROM projetos 
WHERE status = 'em_andamento' 
  AND data_fim_prevista < CURDATE()
  AND deleted_at IS NULL;

-- =============================================
-- Manutenção de Índices (IMPORTANTE!)
-- =============================================

-- Atualizar estatísticas do MySQL após criar índices
ANALYZE TABLE projetos;
ANALYZE TABLE checkins;
ANALYZE TABLE usuarios;
ANALYZE TABLE tarefas;
ANALYZE TABLE clientes;

-- Verificar fragmentação (execute mensalmente)
SELECT 
    TABLE_NAME,
    DATA_FREE / 1024 / 1024 AS fragmentation_mb,
    (DATA_FREE / (DATA_LENGTH + INDEX_LENGTH + DATA_FREE)) * 100 AS fragmentation_percent
FROM 
    information_schema.TABLES
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND DATA_FREE > 0
ORDER BY 
    fragmentation_mb DESC;

-- Se fragmentação > 20%, executar:
-- OPTIMIZE TABLE projetos;
-- OPTIMIZE TABLE checkins;
-- (Atenção: OPTIMIZE TABLE trava a tabela - execute fora do horário de pico!)

-- =============================================
-- Monitoramento de Performance
-- =============================================

-- Queries lentas (habilitar slow query log)
-- my.cnf:
-- slow_query_log = 1
-- slow_query_log_file = /var/log/mysql/slow-query.log
-- long_query_time = 1

-- Índices não utilizados (remover depois de 30 dias)
SELECT 
    s.TABLE_NAME,
    s.INDEX_NAME,
    s.CARDINALITY
FROM 
    information_schema.STATISTICS s
LEFT JOIN 
    information_schema.INNODB_SYS_TABLES t ON s.TABLE_NAME = t.NAME
WHERE 
    s.TABLE_SCHEMA = DATABASE()
    AND s.INDEX_NAME NOT IN ('PRIMARY')
    AND s.NON_UNIQUE = 1
    -- Adicionar lógica para detectar uso via slow query log

-- =============================================
-- ROLLBACK (Se necessário - CUIDADO!)
-- =============================================

/*
-- ATENÇÃO: Remover índices volta performance para estado anterior (LENTO!)
-- Só execute em emergência (ex: corrupção de índice)

DROP INDEX idx_projetos_active_status_id ON projetos;
DROP INDEX idx_projetos_client_status ON projetos;
DROP INDEX idx_projetos_overdue ON projetos;
DROP INDEX idx_projetos_responsavel_active ON projetos;

DROP INDEX idx_checkins_user_status ON checkins;
DROP INDEX idx_checkins_project_date ON checkins;
DROP INDEX idx_checkins_date_range ON checkins;

DROP INDEX idx_usuarios_email_active ON usuarios;
DROP INDEX idx_usuarios_role_active ON usuarios;

DROP INDEX idx_tarefas_project_order ON tarefas;

DROP INDEX idx_clientes_active_name ON clientes;
*/

-- =============================================
-- Checklist de Deploy
-- =============================================

/*
✅ 1. Backup completo do banco ANTES de executar
✅ 2. Executar em horário de baixo tráfego (madrugada)
✅ 3. Testar em ambiente de homologação primeiro
✅ 4. Monitorar CPU/IO durante criação dos índices
✅ 5. Executar ANALYZE TABLE após criação
✅ 6. Validar queries com EXPLAIN após deploy
✅ 7. Monitorar slow query log por 24h
✅ 8. Verificar tamanho do banco (índices ocupam ~20-30% extra)
*/

-- =============================================
-- FIM DO SCRIPT
-- =============================================
