# Módulo de seguridad

## Configuración

Añadir las siguientes propiedades a la constante environment en `src/environments/environment.ts`:

```ts
defaultUsername: '',
defaultPassword: '',
```

Añadir las siguientes propiedades a la constante environment en `src/environments/environment.development.ts`:

```ts
defaultUsername: 'emp@example.com',
defaultPassword: 'P@$$w0rd',
```

Añadir las siguientes rutas en `src/app/app.routes.ts`:

```ts
{ path: 'login', component: LoginForm },
{ path: 'registro', component: RegisterUser },
```

Añadir el interceptor en `src/app/app.config.ts` (añadir también `withInterceptorsFromDi()` a `provideHttpClient()` si es necesario):

```ts
{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true, },
```

## Componentes

- `Login`: Componente del layout principal para la autenticación, para incorporar a el Header.
- `LoginForm`: Componente página para la autenticación.
- `RegisterUser`: Componente página para registro de nuevos usuarios.

## Tokens

- `AUTH_REQUIRED`: Opción HTTP para requerir autenticación.
  - *{ context: new HttpContext().set(AUTH_REQUIRED, true) }*
- `LOGIN_EVENT`: Notificación DomainEvent, el usuario se ha autenticado.
- `LOGIN_FORM_OPEN_EVENT`: Notificación DomainEvent, se ha presentado el LoginForm.
- `LOGIN_FORM_CLOSE_EVENT`:  Notificación DomainEvent, se ha cerrado el LoginForm.
- `LOGOUT_EVENT`: Notificación DomainEvent, el usuario ha cerrado sesión.

## Modelos

- `LoginResponse`: Respuesta del servidor de autenticación.
- `User`: Modelo de usuario.
- `Role`: Modelo de roles (grupos)

## Servicios

- `AuthService`: Servicio de gestión del estado de autenticación.
- `LoginService`: Servicio de negociación de la autenticación con el servidor.
- `RegisterUserDAO`: Servicio de acceso a datos de usuarios.

## Interceptores

- `AuthInterceptor`: Agrega la cabecera `Authorization` con el token `Bearer` a las peticiones.

## Guardianes

- `AuthCanActivate`: Activar si está autenticado.
- `AuthCanActivateChild`: Activar sub rutas si está autenticado.
- `AuthWithRedirectCanActivate`: Redireccionar si no está autenticado.
- `InRoleCanActivate`: Activar si está autenticado y pertenece a un rol.
- `InRoleCanActivateChild`: Activar sub rutas si está autenticado y pertenece a un rol.
- `InRoleCanLoad`: Cargar lazy si está autenticado y pertenece a un rol.
