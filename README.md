# ubicate-front

Frontend web de Ubícate - React 19 + Vite 8

## Requisitos previos

- Node.js 20.19+ o 22.12+ (según los requisitos de Vite)
- npm 10+

## Levantar en desarrollo

```bash
npm ci
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

## Registro y verificación de correo (HU-22)

El flujo requiere el backend de la rama `feature/hu-22-registro-verificacion`.

| Ruta web | Pantalla |
|----------|----------|
| `/#/login` | Inicio de sesión y acceso a registro |
| `/#/registro` | Nombre completo, correo institucional, contraseña y confirmación |
| `/#/verificar-correo` | Correo pendiente, instrucciones y reenvío del enlace |

Las rutas usan hash para permitir recargar y navegar atrás/adelante sin reglas
adicionales en el servidor de archivos estáticos. La ruta vacía o desconocida
muestra el login.

El formulario acepta únicamente el dominio `@correounivalle.edu.co`, nombre y
correo de máximo 150 caracteres, y contraseña con mínimo 8 caracteres, una
mayúscula y un número. La confirmación debe coincidir. El correo se normaliza a
minúsculas; la contraseña se envía sin modificar.

- `POST /api/auth/register`: `{ nombre, correoInstitucional, contrasenia }`.
  Tras una respuesta exitosa, se abre la pantalla de correo pendiente.
- `POST /api/auth/resend-verification`: `{ correoInstitucional }`.
  Una respuesta exitosa activa una espera de 30 segundos antes de otro reenvío.
- Un login que responde `403` con `code: ACCOUNT_NOT_VERIFIED` ofrece continuar
  a la pantalla de verificación. Otros errores `403` no activan esa opción.

Únicamente el correo pendiente y el plazo de reenvío se guardan en
`sessionStorage`; sobreviven a recargas en la misma pestaña. No se guardan las
contraseñas de registro ni el token de verificación. Si el almacenamiento está
bloqueado, el flujo continúa en memoria hasta recargar. El plazo de reenvío es
una ayuda de interfaz, no un límite aplicado por el backend.

El backend crea usuarios con rol `ESTUDIANTE`. Esas cuentas se registran y
verifican desde la web, pero acceden desde Android: el login web conserva su
restricción a administradores.

### Prueba completa con Mailtrap Sandbox

1. Ejecutar el backend de HU-22 con su base de datos preparada, incluyendo el
   rol `ESTUDIANTE` y la sede `Cali`.
2. Configurar las variables del backend `MAIL_HOST`, `MAIL_PORT`,
   `MAIL_USERNAME`, `MAIL_PASSWORD` y, si corresponde, `MAIL_FROM`, con los datos
   SMTP de una bandeja de Mailtrap Sandbox. Estas credenciales pertenecen al
   backend; no deben incluirse en variables `VITE_*`.
3. Configurar `APP_BASE_URL` en el backend con su dirección accesible, por
   ejemplo `http://localhost:8080`, y `VITE_API_URL` en el frontend.
4. Abrir `http://localhost:5173/#/registro`, crear una cuenta y comprobar el
   mensaje capturado en Mailtrap. El backend permite CORS desde
   `http://localhost:5173`.
5. Abrir el enlace del correo. `GET /api/auth/verify?token=...` activa la cuenta
   y muestra una página HTML del backend. El enlace vence en 24 horas y es de un
   solo uso; solicitar otro invalida el anterior.
6. Probar el inicio de sesión en Android con la cuenta activada. Para probar el
   acceso web se necesita una cuenta administrativa.

El backend puede responder éxito aunque falle el envío SMTP. Una respuesta de
registro o reenvío no garantiza entrega: comprobarla en Mailtrap. La página de
activación responde HTTP `200` tanto para éxito como para enlace inválido;
comprobar también su mensaje visible.

### Verificación del frontend

```bash
npm test
npm run lint
npm run build
```

Las pruebas unitarias usan el runner integrado de Node y cubren validaciones,
normalización, estado pendiente, fallos de almacenamiento y cálculo del plazo.
Para revisar la interfaz, probar escritorio y móvil, navegación por teclado,
correo largo, campos inválidos, correo duplicado, error de red, reenvío y recarga.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción en carpeta `dist/` |
| `npm run preview` | Previsualizar build de producción |
| `npm run lint` | Linter (oxlint) |
| `npm test` | Pruebas unitarias de registro y estado de verificación |

## Estructura del proyecto

```
src/
├── main.jsx              # Punto de entrada
├── App.jsx               # Composición principal y sesión
├── index.css             # Estilos globales y variables del tema
├── assets/               # Logos e imágenes
├── features/
│   └── auth/
│       ├── components/   # Formularios y estructura de registro
│       ├── pages/        # LoginPage, RegisterPage y VerifyEmailPage
│       ├── services/     # API, sesión y estado de verificación
│       ├── validation/   # Reglas de registro y pruebas unitarias
│       └── styles/       # Estilos del login, registro y verificación
└── shared/
    └── api/              # Cliente HTTP base
```

## Tecnologías

- React 19
- Vite 8 (build tool + dev server)
- oxlint (linter rápido)
