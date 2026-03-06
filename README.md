# Senti2

App de bienestar emocional: tests, diario, recursos y programas. El front está hecho en Angular, el backend en Laravel y, la auth y parte de los datos, van con Supabase.

## Estructura del repo

- **Senti2/** → frontend (Angular)
- **senti2-backend/** → backend en Laravel

## Stack

- **Front:** Angular, TypeScript, RxJS. Se habla con el backend por HTTP; si no hay sesión o falla la API, el área personal usa `localStorage` como respaldo.
- **Back:** Laravel. Auth y usuarios con Supabase; el backend hace de proxy (login/registro/Google) y valida el JWT en las rutas protegidas.
- **Supabase:** Auth (email + Google) y, opcionalmente, tablas para resultados de tests y diario (usando `SUPABASE_SERVICE_ROLE_KEY` en el servidor).

## Cómo funciona la auth

El login no va directo al front: el front llama al backend (`/api/v1/auth/signin`, etc.), el backend habla con Supabase y devuelve los tokens. El front guarda el token y lo manda en `Authorization: Bearer ...` en las peticiones protegidas. El middleware `verify.supabase` del backend comprueba el token contra Supabase y te deja el usuario en el request.

## API (resumen)

Todo en `http://localhost:8000/api/v1`:

- **Auth:** `POST /auth/signup`, `POST /auth/signin`, `GET /auth/google/url`, `GET /auth/google/callback`, `POST /auth/verify`. Con token: `POST /auth/signout`, `GET /auth/user`.
- **Perfil:** `GET /profile`, `PUT /profile` (protegidos).
- **Área personal:** `GET|POST /area-personal/test-results`, `GET|POST /area-personal/diary-entries` (protegidos).

## Variables de entorno

**Backend** (`senti2-backend/.env`):  
Copia `.env.example` y rellena al menos `APP_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`. `FRONTEND_URL` suele ser `http://localhost:4200` en local. El mail del formulario de contacto va en `MAIL_*`.

**Frontend** (`Senti2/src/environments/environment.ts`):  
`apiUrl` apunta a la API (`http://localhost:8000/api/v1`). IMPORTANTE (por seguridad): La clave de Supabase en el front tienen quu ser la de  **anon**, no la de service_role.

## Cómo levantar todo en local

Backend:

```bash
cd senti2-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
```

Front (otra terminal):

```bash
cd Senti2
npm install
npm start
```

Back en el 8000, front en el 4200. Si quieres usar Supabase para el área personal, crea el proyecto en Supabase y ejecuta el SQL de `supabase_area_personal_tables.sql` (o el equivalente que tengas) para las tablas.

## Tests (backend)

Los tests viven en `senti2-backend` con **Pest** y, para navegador, **Playwright** (`pest-plugin-browser`).

```bash
cd senti2-backend
composer install
npm install
npx playwright install   # solo la primera vez, para los binarios
./vendor/bin/pest        # todos los tests
./vendor/bin/pest tests/Feature tests/Unit   # sin tests de navegador
./vendor/bin/pest --parallel   # más rápido
```

- **Feature:** rutas y API (raíz, contacto, auth).
- **Unit:** tests unitarios básicos.
- **Browser:** tests con Playwright contra la app (p. ej. página de bienvenida). Requieren que el entorno de test esté bien configurado (`.env.testing` o `APP_ENV=testing`).

---

## Qué falta y qué se puede mejorar

**Que no se está haciendo y convendría hacer:**

- **Refresh del token:** Se guarda el `refresh_token` pero no se usa. Cuando el access token caduca, el usuario tiene que volver a loguearse. Haría falta un interceptor HTTP que, ante un 401, intente renovar con el refresh token (y un endpoint en el backend que lo haga con Supabase) y reintente la petición.
- **Tests:** Los tests están en el backend con Pest y Pest Plugin Browser (Playwright). En el front no hay tests. “should create the app”). Para ampliar: más tests de API, auth y tests de navegador contra el front.
- **Variables de entorno en el front:** La URL y la clave de Supabase están hardcodeadas en `environment.ts`. Para producción (y para no commitear secretos) lo ideal es no tener claves en el repo: usar `environment.production.ts` que no se suba, o build con variables (ej. `fileReplacements` / env en CI) y que `apiUrl`, `supabaseUrl` y `supabaseKey` vengan de ahí.

**Mejoras recomendables:**

- **Manejo de errores:** En varios sitios los `catch` solo guardan el error o muestran un mensaje genérico. Unificar (p. ej. un pequeño servicio de notificaciones o toasts) y, donde aplique, distinguir 401/403/500 para mostrar mensajes más claros o redirigir a login.
- **Accesibilidad:** Hay poco uso de `aria-*`, `role` y textos alternativos. Revisar formularios (labels, errores asociados), botones y enlaces (que sean focusables y describibles) y toasts/alertas (live regions) mejora mucho la accesibilidad.
- **Producción:** Tener un `environment.production.ts` (o equivalente) con la URL del API y del front en producción, y asegurarse de que las claves nunca lleguen al repo. En el backend, revisar CORS y que `FRONTEND_URL` en prod apunte a la URL real del front.
- **Guard y redirect:** El guard manda a `/login` pero no guarda la URL a la que intentaba ir el usuario; ya tienes el flujo de `?redirect=` en login. Se podría pasar la URL intentada (p. ej. `state.url` en el guard) a `/login?redirect=...` para que, tras loguearse, vuelva a la página que quería.
