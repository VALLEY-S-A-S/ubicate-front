# Ubícate · Frontend

Portal administrativo en React 19 y Vite 8. Rama:
`feature/auth-roles-importacion-front`, creada desde `dev`.
Plan: [autenticación, activación e importaciones](docs/frontend-plan.md).
Requiere el backend B1–B6 de `feature/auth-roles-importacion-back`.

## Desarrollo

```bash
npm ci
npm run dev
```

Se abre en `http://localhost:5173`, origen permitido por el CORS del backend.
Node.js 20.19+ o 22.12+ y npm 10+ según los requisitos de Vite.
La URL del backend se configura en `.env.local`:

```dotenv
VITE_API_URL=http://localhost:8080
```

En el backend configura `APP_FRONTEND_URL=http://localhost:5173` para que los
correos apunten a esta aplicación. Para enviar invitaciones, el backend debe
tener SMTP configurado y `MAIL_WORKER_ENABLED=true`. Si no se habilita el
trabajador, las cuentas se crean pero los correos permanecen pendientes.
La clave BOOTSTRAP_KEY y las credenciales SMTP pertenecen al backend: nunca se
incluyen en variables VITE_*, assets, URL ni almacenamiento del navegador.

## Rutas y flujo

| Ruta hash | Función |
| --- | --- |
| `/#/login` | Inicio de sesión administrativo |
| `/#/registro` | Configuración del primer ADMIN, solo con requiresSetup=true |
| `/#/activar-cuenta?token=…` | Definir contraseña para cualquier rol |
| `/#/verificar-correo` | Solicitar enlace para una cuenta pendiente |
| `/#/dashboard/usuarios` | Plantilla Excel e importación |
| `/#/dashboard/usuarios?lote=8` | Consultar una importación por número |
| `/#/dashboard/asignaciones` | Filtrar y consultar el horario de asignaciones por espacio |
| `/#/dashboard/espacios` | Administración de espacios existente |

La navegación por hash permite recargar sin reglas especiales del servidor.
Las rutas de activación y reenvío permanecen públicas aunque exista una sesión
administrativa en otra parte de la aplicación.

### Configuración inicial

El frontend consulta GET `/api/auth/bootstrap-status`. Mientras carga o falla,
no habilita el formulario de creación; permite reintentar y seguir al login.
Si requiere configuración, pide nombre, correo institucional, contraseña,
confirmación y clave de instalación. La clave solo vive en memoria y se envía
en `X-Bootstrap-Key`. El registro exitoso conduce al login: el administrador ya
está verificado y no necesita recibir un correo.

Si otra solicitud cerró el registro, BOOTSTRAP_CLOSED oculta el formulario y
explica cómo continuar. Un error de clave permite reintentar sin almacenarla.
Una instalación existente no necesita volver a crear su administrador.

### Sesión

Solo ADMIN/ADMINISTRADOR pueden usar el panel web. El resto de roles recibe
orientación hacia la aplicación móvil, sin guardar su token como sesión web.
La sesión administrativa se guarda en localStorage; si está bloqueado, se
mantiene en memoria hasta recargar. La contraseña y la clave de instalación
nunca forman parte del objeto persistido.

El perfil/rol almacenado no concede acceso: antes de restaurar el panel se
consulta GET `/api/auth/me`. Se vuelve a comprobar al recuperar foco y cada
minuto, excepto en las pantallas públicas de activación y reenvío. Un 401 de una petición autenticada invalida únicamente la sesión del
mismo token. El backend comprueba los permisos de cada operación. Los errores
de red al restaurar muestran reintento y conservan el token sin mostrar el
panel. Si la sesión ya estaba validada, una comprobación de fondo fallida
muestra un aviso y conserva la vista para no interrumpir cargas en curso. Logout llama POST `/api/auth/logout` antes de limpiar la sesión local;
un fallo de red permite reintentar. La eliminación de sesión entre pestañas se
sincroniza mediante el evento storage. Solo un cambio de token o logout de otra
pestaña dispara validación: volver a guardar el mismo perfil no modifica su
fecha ni genera notificaciones. El enfoque del título ocurre al cambiar de
ruta, no al refrescar la sesión, para no interrumpir la escritura en formularios.

### Activación y reenvío

Antes de mostrar los campos de contraseña se consulta
POST `/api/auth/activation-info` con el token del enlace. El formulario muestra
el correo devuelto por el backend como campo de solo lectura; no usa el correo
del administrador que tenga sesión ni un parámetro de correo en la URL. Esta
consulta no activa la cuenta ni consume el enlace. Si falla la conexión, ofrece
reintentar; un enlace inválido, usado o vencido no revela el correo.
Requiere reiniciar el backend actualizado para habilitar este endpoint.

La contraseña requiere ocho caracteres, una mayúscula y un número; se envía
sin recortar espacios y la confirmación debe coincidir. El token se lee del
fragmento y no se guarda en localStorage/sessionStorage ni se envía a la API
por query. Tras éxito o enlace rechazado se elimina del fragmento. Recargar
entonces requiere abrir nuevamente el correo, o iniciar sesión si ya se activó.
La activación no abre una sesión automáticamente. ADMIN puede continuar al
login web; los demás roles reciben instrucciones para usar la aplicación móvil.

Enlaces vencidos, usados o inválidos ofrecen solicitar otro. El reenvío usa el
correo institucional y muestra una respuesta genérica. Solo el correo y el
plazo de espera de 30 segundos se guardan en sessionStorage, con respaldo en
memoria si falla. Las cuentas antiguas pendientes conservan su flujo de
verificación; un login ACCOUNT_NOT_VERIFIED permite acceder al reenvío.
La respuesta de reenvío no garantiza entrega inmediata.

### Excel y seguimiento

El módulo descarga la plantilla `.xlsx` y envía el archivo como FormData en
`archivo`. No fija Content-Type manualmente, para conservar el boundary.
Valida extensión, archivo no vacío y tamaño máximo de 5 MiB. El backend valida
hoja, cabeceras, fórmulas, roles, duplicados y máximo de 1000 usuarios.

Los errores 422 se presentan por fila/campo/mensaje. Un conflicto 409 explica
que no se creó ningún usuario. Un resultado de red incierto no provoca un
reenvío automático: se debe comprobar el resultado antes de repetir la carga.
Los botones impiden acciones simultáneas.

Una creación exitosa muestra número de importación, total, conteos y resultado
por cuenta. El número queda en la URL para recuperar el detalle al recargar.
También puede consultarse otro lote por número; el backend restringe los
resultados a la sede del administrador. Mientras haya PENDIENTE/ENVIANDO se
consulta cada cinco segundos; las consultas se cancelan al navegar o cambiar
de lote. Un error de consulta permite volver a consultar manualmente.

El reintento solo solicita correos fallidos del lote; nunca repite la creación
de usuarios. La entrega del correo y la activación de cuenta son estados
separados. Cuando dejan de existir tareas activas, usa Actualizar estado para
comprobar activaciones posteriores. La UI adapta las tarjetas a pantallas
pequeñas y permite desplazamiento horizontal en tablas.

## Verificación automatizada

```bash
npm test
npm run test:ui
npm run lint
npm run build
```

Los tests de Node cubren cliente HTTP, contratos de autenticación y Excel,
rutas con parámetros, sesión, validaciones y plazo de reenvío. Una regresión con
dos pestañas y eventos storage reproduce la sincronización de sesiones y
verifica que no se generen ciclos de consultas entre ellas. Con Node 26, usado en esta validación,
se pueden ver los casos individuales en un solo proceso con:

```bash
node --test --test-isolation=none
```

`test:ui` compila y renderiza seis comprobaciones reales de componentes con
React en servidor: configuración cerrada mientras se comprueba su estado,
panel inaccesible con sesión sin validar, activación pública con sesión abierta,
enlace incompleto, módulo de usuarios y correo del enlace en solo lectura. No sustituye las pruebas interactivas
en un navegador ni una prueba integrada con PostgreSQL/SMTP.

### Comprobación integrada

1. Arrancar backend B1–B6 y frontend. En una instalación existente verificar que
   login no muestra creación libre y que /#/registro explica el cierre.
2. Iniciar sesión como ADMIN y recargar el panel para comprobar /me. Probar
   también sesión expirada, rol cambiado y backend no disponible.
3. Descargar la plantilla, completar un archivo de prueba e importarlo. Revisar
   número de lote y correos capturados en el SMTP sandbox configurado.
4. Abrir un enlace en escritorio y en ancho móvil; activar la cuenta, comprobar
   la orientación por rol y rechazar su reutilización.
5. Probar Excel con errores, archivo demasiado grande, fallo de red, consulta
   tras recarga y reintento de correos fallidos. No repetir ciegamente una carga
   cuyo resultado no se pudo confirmar.
6. Solicitar otro enlace, comprobar espera/recarga y cerrar sesión desde el
   menú. Revisar navegación por teclado y formularios en pantallas pequeñas.

Los prototipos locales `public/registro-*.html` no forman parte de esta entrega.
No se añadieron dependencias nuevas ni se modificó el backend o la aplicación móvil.
