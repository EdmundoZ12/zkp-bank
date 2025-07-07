const { query } = require("../../database/connection");

class Usuario {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.cedula_hash = data.cedula_hash;
    this.fecha_hash = data.fecha_hash;
    this.codigo_hash = data.codigo_hash;
    this.numero_cuenta = data.numero_cuenta;
    this.saldo = parseFloat(data.saldo);
    this.estado = data.estado;
    this.fecha_creacion = data.fecha_creacion;
    this.ultimo_acceso = data.ultimo_acceso;
  }

  // Buscar usuario por username
  static async findByUsername(username) {
    try {
      const result = await query(
        "SELECT * FROM usuarios WHERE username = $1 AND estado = $2",
        [username, "activo"]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Usuario(result.rows[0]);
    } catch (error) {
      throw new Error(`Error buscando usuario: ${error.message}`);
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    try {
      const result = await query("SELECT * FROM usuarios WHERE id = $1", [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new Usuario(result.rows[0]);
    } catch (error) {
      throw new Error(`Error buscando usuario por ID: ${error.message}`);
    }
  }

  // Crear nuevo usuario
  static async create(userData) {
    try {
      // Generar número de cuenta único
      const numeroCuenta = await Usuario.generateAccountNumber();

      const result = await query(
        `INSERT INTO usuarios (username, cedula_hash, fecha_hash, codigo_hash, numero_cuenta, saldo)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
        [
          userData.username,
          userData.cedula_hash,
          userData.fecha_hash,
          userData.codigo_hash,
          numeroCuenta,
          userData.saldo || 0.0,
        ]
      );

      return new Usuario(result.rows[0]);
    } catch (error) {
      if (error.code === "23505") {
        // Unique violation
        throw new Error("El username ya existe");
      }
      throw new Error(`Error creando usuario: ${error.message}`);
    }
  }

  // Actualizar saldo
  async updateSaldo(nuevoSaldo, descripcion = "") {
    try {
      const result = await query(
        `UPDATE usuarios SET saldo = $1 WHERE id = $2 RETURNING *`,
        [nuevoSaldo, this.id]
      );

      // Registrar transacción
      await query(
        `INSERT INTO transacciones (usuario_id, tipo, monto, saldo_anterior, saldo_nuevo, descripcion)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          this.id,
          nuevoSaldo > this.saldo ? "deposito" : "retiro",
          Math.abs(nuevoSaldo - this.saldo),
          this.saldo,
          nuevoSaldo,
          descripcion,
        ]
      );

      this.saldo = nuevoSaldo;
      return this;
    } catch (error) {
      throw new Error(`Error actualizando saldo: ${error.message}`);
    }
  }

  // Generar número de cuenta único
  static async generateAccountNumber() {
    let numero;
    let existe = true;

    while (existe) {
      numero = `001-${Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, "0")}`;

      const result = await query(
        "SELECT id FROM usuarios WHERE numero_cuenta = $1",
        [numero]
      );

      existe = result.rows.length > 0;
    }

    return numero;
  }

  // Obtener todas las transacciones del usuario
  async getTransacciones(limit = 10) {
    try {
      const result = await query(
        `SELECT t.*, u2.username as destinatario_username 
                 FROM transacciones t
                 LEFT JOIN usuarios u2 ON t.destinatario_id = u2.id
                 WHERE t.usuario_id = $1 
                 ORDER BY t.fecha DESC 
                 LIMIT $2`,
        [this.id, limit]
      );

      return result.rows;
    } catch (error) {
      throw new Error(`Error obteniendo transacciones: ${error.message}`);
    }
  }

  // Listar todos los usuarios (para admin)
  static async findAll(limit = 50, offset = 0) {
    try {
      const result = await query(
        `SELECT id, username, numero_cuenta, saldo, estado, fecha_creacion, ultimo_acceso
                 FROM usuarios 
                 ORDER BY fecha_creacion DESC 
                 LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows.map((row) => new Usuario(row));
    } catch (error) {
      throw new Error(`Error listando usuarios: ${error.message}`);
    }
  }

  // Actualizar último acceso
  async updateLastAccess() {
    try {
      await query("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1", [
        this.id,
      ]);
      this.ultimo_acceso = new Date();
    } catch (error) {
      console.error("Error actualizando último acceso:", error.message);
    }
  }

  // Método para obtener datos seguros (sin hashes)
  toSafeObject() {
    return {
      id: this.id,
      username: this.username,
      numero_cuenta: this.numero_cuenta,
      saldo: this.saldo,
      estado: this.estado,
      fecha_creacion: this.fecha_creacion,
      ultimo_acceso: this.ultimo_acceso,
    };
  }
}

module.exports = Usuario;
