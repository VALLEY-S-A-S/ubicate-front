# ubicate-front

Frontend web de Ubícate - React 19 + Vite 8

## Requisitos previos

- Node.js 20+ LTS
- npm 10+

## Levantar en desarrollo

```bash
npm install
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

## Variables de entorno

Copia `.env.example` a `.env.local` y ajusta la URL del backend si es necesario:

```bash
VITE_API_URL=http://localhost:8080
```

Si no se define, la aplicación usa `http://localhost:8080` por defecto.

## Conexión al backend

- Backend esperado en: **http://localhost:8080**
- Health check: `GET /api/health` → `{"status":"ok"}`
- CORS configurado en backend para permitir `http://localhost:5173`
- Login: `POST /api/auth/login` con
  `{ "correoInstitucional": "...", "contrasenia": "..." }`
- La web solo permite roles administrativos; los demás roles deben usar la
  aplicación móvil.
- El token JWT se guarda en `localStorage` y la sesión se recupera al recargar.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción en carpeta `dist/` |
| `npm run preview` | Previsualizar build de producción |
| `npm run lint` | Linter (oxlint) |

## Estructura del proyecto

```
src/
├── main.jsx              # Punto de entrada
├── App.jsx               # Composición principal y sesión
├── index.css             # Estilos globales y variables del tema
├── assets/               # Logos e imágenes
├── features/
│   └── auth/
│       ├── components/   # LoginForm
│       ├── pages/        # LoginPage
│       ├── services/     # authApi y sesión
│       └── styles/       # Estilos del login
└── shared/
    └── api/              # Cliente HTTP base
```

## Tecnologías

- React 19
- Vite 8 (build tool + dev server)
- oxlint (linter rápido)
