# cmb-fe

Frontend del Sistema de Gestión de Turnos Médicos del Centro Médico Belgrano
(UGD · Aplicaciones Web y Móvil). React 19 + TypeScript + Vite, con
autenticación por token de Laravel Sanctum y protección de rutas por rol.

El diseño, los datos de ejemplo y las pantallas a construir salen del prototipo
de `doc/vistas/`; el análisis del TP está en `doc/tp1-documento.html`.

## Requisitos

- Node `>=24.22.1 <25`
- pnpm `>=12.5.1 <13`

Para el backend no hace falta nada instalado: `cmb-be` corre entero en Docker.

## Puesta en marcha

### 1. Dependencias

```bash
corepack enable
pnpm install
```

`corepack enable` usa la versión de pnpm que fija `package.json`
(`packageManager`), así todos instalan con la misma.

### 2. Variables de entorno

```bash
cp .env.example .env
```

| Variable | Para qué | Valor por defecto |
| --- | --- | --- |
| `VITE_AUTH_MODE` | De dónde salen los datos: `sanctum` (API) o `prototype` (sin backend) | `sanctum` |
| `VITE_API_URL` | Base de la API de `cmb-be` | `http://localhost:8000/api/v1` |
| `VITE_APP_PORT` | Puerto del servidor de desarrollo | `3000` |
| `VITE_PUBLIC_ENVIRONMENT`, `VITE_PUBLIC_APP_VERSION`, `VITE_PUBLIC_PROJECT_SHORT_NAME` | Lo que muestra el pie de la interfaz | — |

### 3. Arrancar

```bash
pnpm dev
```

Queda en `http://localhost:3000`. Si ese puerto está ocupado, Vite toma el
siguiente libre y lo avisa en la consola.

### Con backend o sin backend

| `VITE_AUTH_MODE` | Qué hace | Cuándo conviene |
| --- | --- | --- |
| `sanctum` | Login y datos contra `cmb-be` | Para probar el sistema completo |
| `prototype` | Todo se resuelve en el navegador con los datos de `src/prototype/` | Para trabajar en pantallas sin levantar Docker |

Con `prototype` no hace falta nada más: las cuentas son las de
`src/modules/auth/data/demo-accounts.ts`, todas con la contraseña
`turnos2026`.

Con `sanctum` hay que tener la API arriba **antes** de abrir el front. Los
pasos completos están en `../cmb-be/README.md`; el `.env.example` del backend
ya la deja en `http://localhost:8000`, que es a donde apunta `VITE_API_URL`. La
API acepta pedidos desde cualquier puerto de `localhost`, así que no hay nada
que tocar en CORS.

### Levantar el sistema completo

```bash
# terminal 1 — API
cd cmb-be
cp .env.example .env
docker compose up -d
docker compose exec cmb-api composer install
docker compose exec cmb-api php artisan key:generate
docker compose exec cmb-api php artisan migrate --seed

# terminal 2 — interfaz
cd cmb-fe
cp .env.example .env
pnpm install
pnpm dev
```

Después se entra por `http://localhost:3000/login` con alguna de las cuentas
sembradas, que están más abajo.

### Scripts

| Script                | Descripción                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `pnpm dev`            | Servidor de desarrollo (puerto `VITE_APP_PORT`)                    |
| `pnpm build`          | Typecheck (`tsconfig.app` + `tsconfig.node`) y build de producción |
| `pnpm preview`        | Sirve el build de producción                                       |
| `pnpm lint`           | Valida uso de `import.meta.env` y corre Biome                      |
| `pnpm check`          | Biome con autofix                                                  |
| `pnpm test`           | Jest (jsdom)                                                       |
| `pnpm test:coverage`  | Jest con cobertura (umbral global 80/85)                           |
| `pnpm test:typecheck` | Typecheck incluyendo los tests                                     |

## Variables de entorno

Las valida Zod en `src/config/env-config.ts`: si falta o es inválida alguna, la
app falla al arrancar con el listado de claves a revisar.

`import.meta.env` **solo** puede usarse en `src/config/env-config.ts`; el resto
del código importa `envConfig`. Lo verifica `check-no-direct-env.mjs` dentro de
`pnpm lint`.

### Se resuelven al compilar

Vite **incrusta** las `VITE_*` en el bundle cuando corre `pnpm build`: no las
lee al arrancar. Un `.env` junto a los archivos ya servidos no hace nada, y un
build sin `.env` termina bien pero deja la app pidiendo las claves en el
navegador. Las variables tienen que estar presentes en el momento de compilar.

Con Docker el `.env` queda fuera del contexto de build por `.dockerignore`, así
que viajan como argumentos: `docker-compose.yml` las interpola del `.env` del
host y el `Dockerfile` las recibe con `ARG`. Para construir a mano:

```bash
docker build --build-arg VITE_API_URL=https://mi-api/api/v1 -t cmb-fe .
```

Si `VITE_API_URL` falta, el build falla a propósito en lugar de generar una
imagen que recién se rompe en el navegador.

## Autenticación

Sesión por **token personal de Laravel Sanctum** (RF-02). El token se guarda en
`localStorage` (`auth-storage`, Zustand `persist`) y viaja en cada request como
`Authorization: Bearer`.

`VITE_AUTH_MODE` elige de dónde sale la sesión:

| Modo | Qué hace |
| --- | --- |
| `sanctum` | Pega contra `cmb-be` |
| `prototype` | Resuelve el login en el front con las cuentas de `src/modules/auth/data/demo-accounts.ts` |

### Endpoints

| Método | Ruta | Para qué |
| --- | --- | --- |
| `POST` | `/auth/users/login` | Personal del centro |
| `POST` | `/auth/patients/login` | Pacientes |
| `GET` | `/auth/me` | Revalida el token guardado |
| `POST` | `/auth/logout` | Revoca sólo el token en uso |

El login manda `email`, `password` y `device_name`. La API guarda **un token
vigente por actor y dispositivo**, así que `device-name.ts` genera un nombre
estable por navegador y lo persiste: si cambiara en cada ingreso, cada login
dejaría un token huérfano.

La API separa los actores pero el formulario es uno solo, así que el servicio
prueba `users` y, ante un `401`, reintenta con `patients`. El límite de intentos
de la API es por actor, correo e IP, de modo que los dos intentos caen en
cubetas distintas.

Respuesta del login:

```json
{
  "message": "Sesión iniciada.",
  "statusCode": 200,
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "actor_type": "users",
  "data": { "id": 1, "name": "...", "email": "...", "roles": ["reception"] }
}
```

De ahí sale el `AppRole`: `actor_type: "patients"` es `patient`, y para el
personal se toma el primer rol conocido de `data.roles`.

Los tokens de Sanctum no se renuevan: ante un `401` el interceptor cierra la
sesión, limpia la caché de TanStack Query y manda a `/login`.

«Continuar con Google» (RF-03) manda el navegador a
`GET {VITE_API_URL}/auth/google/redirect`, donde Laravel Socialite resolverá el
flujo. **Ese endpoint todavía no existe en el backend.**

El widget de reCAPTCHA es un marcador visual: valida como campo requerido pero
todavía no verifica contra Google.

### Cuentas sembradas

`docker compose exec cmb-api php artisan db:seed` en `cmb-be` crea una cuenta
por rol, todas con la misma contraseña (`SEED_ACCOUNT_PASSWORD`, por defecto
`Belgrano2026`):

| Correo | Rol |
| --- | --- |
| `admin@example.com` | admin |
| `reception@example.com` | reception |
| `professional@example.com` | professional |
| `patient@example.com` | patient |

## Roles

Cuatro roles, en `src/shared/constants/roles.ts`, con los nombres de
`doc/vistas/data/roles.json`:

| Rol | Etiqueta | Aplicación |
| --- | --- | --- |
| `admin` | Administrador | Back-office |
| `reception` | Recepción | Back-office |
| `professional` | Profesional | Back-office |
| `patient` | Paciente | Portal del paciente |

**No hay permisos en el frontend**: el acceso se decide por rol. El control real
vive en la API (RNF-02); ocultar un control en la interfaz no es control de
acceso.

## Protección de rutas

| Componente | Responsabilidad |
| --- | --- |
| `src/router/private-route.tsx` | Exige sesión; sin token redirige a `/login` guardando `location` en `state.from` |
| `src/router/public-route.tsx` | `/login` y `/registro` solo para anónimos |
| `src/router/landing-path.ts` | A qué pantalla va cada rol después de entrar |
| `src/shared/components/auth/require-role.tsx` | Envuelve cada página y exige el rol de la ruta |
| `src/shared/components/auth/role-gate.tsx` | Renderizado condicional por rol (menús, acciones) |
| `src/shared/hooks/use-has-role.ts` | `true` si la sesión tiene **alguno** de los roles pedidos |

Ambos guards esperan la hidratación del store persistido (`useHydration`) antes
de decidir, para no expulsar al usuario en el primer render.

Para agregar una página protegida, sumá un `NavItem` a `AppRoutesWithRoles` en
`src/router/nav-items.tsx`: de ahí salen las rutas (con `RequireRole`), el
sidebar y la barra inferior del portal.

`normalizeRole()` filtra lo que llega del backend, así un rol desconocido nunca
entra al store: la sesión queda sin rol y los guards la rechazan.

## Datos del prototipo

Con `VITE_AUTH_MODE=prototype`, `src/prototype/` hace de capa de datos y la app
funciona sin backend:

- `data/*.json` — copia del seed de `doc/vistas/data`
- `build-state.ts` — genera 57 días de agenda con semilla fija (mismos datos en cada reinicio)
- `prototype-store.ts` — persiste en `localStorage` (`cmb.turnos.v1`) y expone consultas y comandos

Cada servicio decide el origen con `isSanctumAuthMode()`, así que las dos
versiones conviven: una rama pega contra la API y la otra contra el store del
prototipo. Las pruebas de Jest corren siempre en modo prototipo.

El cálculo de disponibilidad (RF-13) vive aparte, en
`src/modules/scheduling/utils/availability.ts`: es una función pura que recibe
agendas, feriados, excepciones y turnos, y no toca ni el DOM ni el storage.

## Estilos

**Todo con Tailwind, sin CSS a mano.** `src/styles/tailwind.css` solo tiene el
`@import` y el `@config`; no hay reglas propias ni estilos inline en el JSX.

Los tokens de `tailwind.config.js` replican uno a uno los de
`doc/vistas/css/base.css` (`accent`, `sidebar`, `ink`, `border-strong`,
`booked`, `no-show`…), así portar cada vista del prototipo es traducir clases.
Tipografía IBM Plex Sans/Mono, esquinas rectas y superficies planas separadas
por bordes de 1px.

## Pantallas

| Vista del prototipo | Ruta | Quién entra |
| --- | --- | --- |
| `index.html` | `/` | Público |
| `login.html` | `/login` | Público |
| `registro.html` (portal) | `/registro` | Público |
| `dashboard.html` | `/panel` | admin, reception, professional |
| `agenda.html` | `/agenda` | admin, reception, professional |
| `solicitar-turno.html` (mostrador) | `/turnos/nuevo` | admin, reception |
| `registro.html` (mostrador + listado) | `/pacientes` | admin, reception |
| `solicitar-turno.html` (portal) | `/solicitar-turno` | patient |
| — | `/mis-turnos` | patient |

`/turnos/nuevo?reprogramar=<id>` es la misma pantalla en modo reprogramación, a
donde lleva el panel de detalle de la agenda. `/mis-turnos` todavía es la
pantalla puente de sesión: el endpoint `GET /portal/appointments` ya existe,
falta la vista.

## Estructura

```
src/
├── app/main.tsx              # bootstrap: providers + router
├── config/                   # env, axios, interceptores, query client
├── modules/
│   ├── agenda/               # agenda diaria: grilla, detalle, ausencias
│   ├── auth/                 # login, store de sesión, cuentas del prototipo
│   ├── dashboard/            # panel del back-office
│   ├── home/                 # pantalla puente post-login
│   ├── landing/              # sitio público
│   ├── patients/             # ficha del paciente: schema, servicio, pantallas
│   └── scheduling/           # turnos: disponibilidad, reserva, comprobante
├── prototype/                # datos y store que reemplazan a la API
├── router/                   # composición de rutas y guards
├── shared/                   # componentes, hooks, layouts, tipos y utilidades
└── styles/
tests/                        # setup, helpers y mocks de Jest
```

## Convenciones

Ver `AGENTS.md`, `docs/coding-conventions.md` y `docs/commits-and-branches.md`.
Nombres de archivo en `kebab-case` (lo valida Biome).
