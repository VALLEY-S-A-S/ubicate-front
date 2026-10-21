# ubicate-front

Frontend web de Ubicate - React 19 + Vite 8

## Requisitos previos

- Node.js 20+ LTS
- npm 10+

## Levantar en desarrollo

```bash
npm install
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción en carpeta `dist/` |
| `npm run preview` | Previsualizar build de producción |
| `npm run lint` | Linter (oxlint) |

## Conexión al backend

- Backend esperado en: **http://localhost:8080**
- Health check: `GET /api/health` → `{"status":"ok"}`
- CORS configurado en backend para permitir `http://localhost:5173`

## Estructura del proyecto

```
src/
├── main.jsx           # Punto de entrada
├── App.jsx            # Componente principal
├── App.css            # Estilos del componente principal
├── index.css          # Estilos globales
└── assets/            # Imágenes, iconos, etc.
```

## Tecnologías

- React 19
- Vite 8 (build tool + dev server)
- oxlint (linter rápido)