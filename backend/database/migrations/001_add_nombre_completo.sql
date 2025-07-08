-- Migración para agregar campo nombre_completo
-- Ejecutar en PostgreSQL

-- Agregar columna nombre_completo a tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(255);

-- Actualizar registros existentes (opcional)
UPDATE usuarios 
SET nombre_completo = 'Juan Pérez Demo' 
WHERE username = 'juan_perez' AND nombre_completo IS NULL;

-- Comentario
-- Esta migración agrega soporte para nombre completo en el registro de usuarios
