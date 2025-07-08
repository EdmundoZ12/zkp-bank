# ZKP Banking Frontend

Frontend React para el sistema de banca con Zero-Knowledge Proof (ZKP).

## Características

- **Autenticación ZKP**: Login seguro utilizando pruebas de conocimiento cero
- **Registro de usuarios**: Creación de nuevas cuentas bancarias
- **Dashboard bancario**: Gestión de balance, transferencias e historial
- **UI moderna**: Interfaz responsive con TailwindCSS
- **Notificaciones**: Feedback en tiempo real con React Hot Toast

## Tecnologías

- React 18
- Vite
- TailwindCSS
- Axios
- React Router DOM
- React Hot Toast
- Lucide React (iconos)

## Instalación

```bash
cd frontend
npm install
```

## Desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173/`

## Estructura

```
src/
├── components/
│   ├── auth/
│   │   ├── ZKPLogin.jsx     # Componente de login con ZKP
│   │   └── Register.jsx     # Componente de registro
│   └── dashboard/
│       └── Dashboard.jsx    # Dashboard principal
├── services/
│   └── api.js              # Servicios de API
├── App.jsx                 # Componente principal
└── main.jsx               # Punto de entrada
```

## API Endpoints

El frontend se conecta al backend en `http://localhost:3000` con los siguientes endpoints:

- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Autenticación inicial
- `POST /zkp/generate-proof` - Generación y verificación de prueba ZKP
- `GET /cuenta/balance` - Consulta de balance
- `POST /cuenta/transfer` - Transferencias
- `GET /cuenta/transactions` - Historial de transacciones

## Flujo de Autenticación ZKP

1. **Login inicial**: El usuario ingresa credenciales (usuario + fecha de nacimiento)
2. **Validación**: Se verifica que las credenciales sean correctas
3. **Generación ZKP**: Se genera automáticamente una prueba criptográfica
4. **Verificación**: Se verifica la prueba en la blockchain
5. **Acceso**: Si todo es correcto, se otorga acceso al dashboard

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Linting del código

## Configuración

El frontend está configurado para conectarse al backend en `http://localhost:3000`. Para cambiar esto, modifica la variable `API_BASE_URL` en `src/services/api.js`.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
