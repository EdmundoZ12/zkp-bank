-- Migración para agregar campo nombre_completo a la tabla usuarios
-- Ejecutar este script en la base de datos existente

-- 1. Agregar la columna nombre_completo
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(255);

-- 2. Actualizar el usuario existente con un nombre por defecto
UPDATE usuarios 
SET nombre_completo = 'Juan Pérez García' 
WHERE username = 'juan_perez' AND nombre_completo IS NULL;

-- 3. Hacer el campo obligatorio después de actualizar datos existentes
ALTER TABLE usuarios 
ALTER COLUMN nombre_completo SET NOT NULL;

-- 4. Verificar la estructura actualizada
\d usuarios;

-- 5. Mostrar usuarios existentes
SELECT id, username, nombre_completo, numero_cuenta, saldo FROM usuarios;
