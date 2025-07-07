-- Crear base de datos
CREATE DATABASE db_zkpbank;

-- Conectar a la base de datos
\c db_zkpbank;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    cedula_hash BIGINT[] NOT NULL,           -- SHA256 como array de 8 enteros
    fecha_hash BIGINT[] NOT NULL,            -- SHA256 como array de 8 enteros  
    codigo_hash BIGINT[] NOT NULL,           -- SHA256 como array de 8 enteros
    numero_cuenta VARCHAR(20) UNIQUE NOT NULL,
    saldo DECIMAL(15,2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'activo',     -- 'activo', 'bloqueado', 'cerrado'
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    ultimo_acceso TIMESTAMP,
    
    CONSTRAINT check_saldo_positivo CHECK (saldo >= 0),
    CONSTRAINT check_estado_valido CHECK (estado IN ('activo', 'bloqueado', 'cerrado'))
);

-- Tabla de transacciones
CREATE TABLE transacciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL,               -- 'deposito', 'retiro', 'transferencia_enviada', 'transferencia_recibida'
    monto DECIMAL(15,2) NOT NULL,
    saldo_anterior DECIMAL(15,2) NOT NULL,
    saldo_nuevo DECIMAL(15,2) NOT NULL,
    destinatario_id INTEGER REFERENCES usuarios(id),  -- Para transferencias
    descripcion TEXT,
    ip_address INET,
    fecha TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT check_monto_positivo CHECK (monto > 0),
    CONSTRAINT check_tipo_valido CHECK (tipo IN ('deposito', 'retiro', 'transferencia_enviada', 'transferencia_recibida'))
);

-- Tabla de sesiones ZKP
CREATE TABLE sesiones_zkp (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    proof_hash VARCHAR(64) UNIQUE NOT NULL,  -- Hash de la prueba para evitar replay attacks
    ip_address INET NOT NULL,
    user_agent TEXT,
    verificado BOOLEAN DEFAULT FALSE,
    token_jwt TEXT,                          -- Token generado tras verificación exitosa
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    expira_en TIMESTAMP DEFAULT NOW() + INTERVAL '30 minutes',
    
    CONSTRAINT check_expiracion CHECK (expira_en > fecha_creacion)
);

-- Tabla de administradores
CREATE TABLE administradores (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,     -- bcrypt hash
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    permisos TEXT[] DEFAULT ARRAY['crear_usuarios', 'ver_usuarios', 'gestionar_saldos'],
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_numero_cuenta ON usuarios(numero_cuenta);
CREATE INDEX idx_transacciones_usuario ON transacciones(usuario_id);
CREATE INDEX idx_transacciones_fecha ON transacciones(fecha);
CREATE INDEX idx_sesiones_usuario ON sesiones_zkp(usuario_id);
CREATE INDEX idx_sesiones_expiracion ON sesiones_zkp(expira_en);

-- Crear administrador por defecto
INSERT INTO administradores (username, password_hash, nombre_completo, email) 
VALUES (
    'admin_zkbank',
    '$2b$10$rQJ5PjQQQjQQQjQQQjQQQu',  -- bcrypt de 'admin123456'
    'Administrador ZKBank',
    'admin@zkbank.com'
);

-- Datos de ejemplo (opcional para testing)
INSERT INTO usuarios (username, cedula_hash, fecha_hash, codigo_hash, numero_cuenta, saldo) 
VALUES (
    'juan_perez',
    ARRAY[3505187840, 2285241134, 2369786286, 4012015903, 3139173167, 869564650, 2666891849, 3092339949],
    ARRAY[848475420, 220246150, 2532582270, 3289355946, 1790110478, 369134943, 2819628715, 1868327884],
    ARRAY[1309474091, 2892784570, 2947769567, 2108817575, 1190024687, 3822148580, 3143003389, 3954683174],
    '001-123456789',
    15000.50
);

-- Trigger para actualizar ultimo_acceso
CREATE OR REPLACE FUNCTION actualizar_ultimo_acceso()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = NEW.usuario_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ultimo_acceso
    AFTER INSERT ON sesiones_zkp
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_ultimo_acceso();

-- Función para limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION limpiar_sesiones_expiradas()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sesiones_zkp WHERE expira_en < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;