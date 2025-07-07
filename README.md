# ZKP Bank Authentication System

## Estructura del Proyecto

### Circuitos
- `circuits/hello/` - Circuito de prueba básico
- `circuits/identity/` - Circuito de autenticación bancaria

### Comandos
```bash
# Trabajar con circuito de identidad
.\zk.ps1 identity compile -i identity.zok
.\zk.ps1 identity setup
.\zk.ps1 identity compute-witness -a [args]

# Trabajar con circuito hello
.\zk.ps1 hello compile -i hello.zok
.\zk.ps1 hello setup