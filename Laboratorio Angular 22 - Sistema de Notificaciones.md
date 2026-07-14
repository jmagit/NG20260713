# Laboratorio Angular 22 - Sistema de Notificaciones

## Objetivo del laboratorio

En una aplicación es común realizar notificaciones al usuario que se le deben mostrar, la forma de presentar las notificaciones puede variar de una aplicación a otra, incluso dentro de la misma aplicación, pero la necesidad persiste.

Vamos a crear un servicio que será el encargado de la gestión de las notificaciones (ViewModel) y será inyectado a cualquier otro artefacto que requiera realizar notificaciones al usuario. Para mejorar su reutilización se creará como contenedor de múltiples notificaciones y que avise cuando reciba una nueva notificación. El servicio se apoyará en un modelo, con la estructura de la notificación, y en una enumeración, que fijará los tipos de notificación.

Para crear la vista, presentación de las notificaciones, crearemos un componente que permitirá la interacción del usuario con múltiples notificaciones.

Siguiendo los principios de modularidad, crearemos un módulo con los servicios generales de la aplicación (carpeta `src/app/common-services`), otro módulo para la capa principal de presentación de la aplicación o layout (carpeta `src/app/layout`) y un módulo de característica con los ejemplos de prueba (carpeta `src/app/ejemplos`).

## Paso 1. Módulo CommonServices

### Módulo

Crear la carpeta del módulo de CommonServices:

```bash
md src/app/common-services
```

### Servicio

Crear el servicio de notificaciones:

```bash
ng generate service common-services/notification
```

Editar el fichero `src/app/common-services/notification.ts`.

Renombra la clase del servicio generada a `NotificationService`:

```ts
// Para sustituir por código de la enumeración
// Para sustituir por código del modelo
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Para sustituir por el resto del código de la clase
}
```

Añadir, después de los imports (en *Para sustituir por código de la enumeración*), la enumeración de *tipo de notificación*.

```ts
export enum NotificationType { error = 'error', warn = 'warn', info = 'info', log = 'log' }
```

A continuación de la enumeración (en *Para sustituir por código del modelo*) y antes del servicio (`@Injectable`), el *modelo* de la notificación:

```ts
export class Notification {
  constructor(private id: number, private message: string,
    private type: NotificationType) { }
  public get Id() { return this.id; }
  public get Message() { return this.message; }
  public get Type() { return this.type; }
}
```

Completar el resto del código de la clase en `// Para sustituir por el resto del código de la clase`.

Exponer la enumeración como atributo de solo lectura para evitar problemas con las plantillas:

```ts
public readonly NotificationType = NotificationType;
```

Añadir un atributo, como señal, con la colección de notificaciones.

```ts
private readonly listado: WritableSignal<Notification[]> = signal([]);
```

Añadir un atributo, como señal calculada, que indica si hay notificaciones:

```ts
public readonly HayNotificaciones = computed(() => this.Listado().length > 0);
```

Inyectar en el constructor el `LoggerService` para realizar las notificaciones de depuración (realizar el import correspondiente):

```ts
constructor(private logger: LoggerService) { }
```

Exponer como propiedad (solo lectura) la versión solo lectura de la señal listado para no romper la encapsulación e impedir que la señal se manipule fuera del control del servicio.

```ts
public get Listado() { return this.listado.asReadonly(); }
```

Crear el método que permite añadir nuevas notificaciones:

```ts
public add(msg: string, type: NotificationType = NotificationType.error) {
  if (!msg || msg === '') {
    this.logger.error('Falta el mensaje de notificación.');
    return;
  }
  const id = this.HayNotificaciones() ?
    (this.Listado()[this.Listado().length - 1].Id + 1) : 1;
  const n = new Notification(id, msg, type);
   this.listado.update(value => [...value, n]);
  // Redundancia: Los errores también se muestran en consola
  if (!environment.production && type === NotificationType.error) {
    this.logger.error(`NOTIFICATION: ${msg}`);
  }
}
```

Crear el método que permite eliminar una notificación indicando su posición en la colección:

```ts
public remove(index: number) {
  if (index < 0 || index >=  this.listado().length) {
    this.logger.error('Index out of range.');
    return;
  }
   this.listado.update(value => value.filter((item, ind) => ind !== index));
}
```

Crear un segundo método que permite eliminar una notificación indicando su identificador:

```ts
public removeById(id: number) {
   this.listado.update(value => value.filter((item) => item.Id !== id));
}
```

Crear el método que elimina todas las notificaciones de la colección:

```ts
public clear() {
  if (this.HayNotificaciones())
     this.listado.set([]);
}
```

Guardar el fichero `src/app/common-services/notification.ts`.

### Referenciado

Registrar en `src/app/common-services/index.ts` los nuevos tipos creados (creando el fichero si es necesario).

```ts
export * from './notification';
```

## Paso 2. Módulo Layout

### Módulo

Crear la carpeta del módulo de Layout:

```bash
md src/app/layout
```

### Componente Notification

Crear el componente de notificaciones dentro del módulo:

```bash
ng generate component layout/notification
```

#### La clase del componente

Editar el fichero `src/app/layout/notification/notification.ts` con la clase del componente.

Realizar las importaciones en el componente de las declaraciones utilizadas en la plantilla (realizar el import correspondiente):

```ts
@Component({
  :
  imports: [I18nSelectPipe],
  :
})
export class Notification {
```

Inyectar en el constructor el `NotificationService` que actuará como ViewModel de la vista (realizar el import correspondiente):

```ts
constructor(private vm: NotificationService) { }
```

Exponer el ViewModel, como propiedad de solo lectura, para permitir la vinculación desde la plantilla:

```ts
public get VM() { return this.vm; }
```

Guardar el fichero.

#### La plantilla del componente

Editar el fichero `src/app/layout/notification/notification.html`, con la plantilla del componente, y sustituir el código por defecto por:

```html
@if(VM.HayNotificaciones()) {
  <div class="notificaciones">
    @for(item of VM.Listado(); track item.Id) {
      <div class="alert {{item.Type | i18nSelect:{
          'error':'alert-danger',
          'warn':'alert-warning', 'info':'alert-primary',
          'other':'alert-success' } }} alert-dismissible fade show"
          role="alert">
        {{item.Message}}
        <button type="button" class="btn-close" data-bs-dismiss="alert"
          aria-label="Close" (click)="VM.remove($index)"></button>
      </div>
    }
    <div class=" text-center">
      <button class="btn btn-info" type="button"
        (click)="VM.clear()">Cerrar</button>
    </div>
  </div>
}
```

Guardar el fichero.

### Referenciado

Registrar en `src/app/layout/index.ts` los nuevos tipos creados (creando el fichero si es necesario).

```ts
:
export * from './notification/notification'
```

## Paso 3. Layout

*Incorporar al componente principal (layout) el nuevo componente creado.*

Editar el fichero `src/app/app.ts` con la clase y añadir la declaración del componente `Notification` (realizar el import de la clase correspondiente):

```ts
@Component({
  selector: 'app-root',
  imports: [ ... , Notification, ],
  :
})
export class App {
```

Editar el fichero `src/app/app.html` con la plantilla para añadir la etiqueta del nuevo componente:

```html
<app-header />
<div class="container-fluid" style="margin-top: 90px; margin-bottom: 50px">
  <main class="p-2">
    <app-notification />
    <router-outlet />
  </main>
</div>
<app-footer />
```

Guardar ficheros.

## Paso 4. Verificación

*Para probar el nuevo sistema de notificaciones vamos a crear un componente Demos en el módulo Ejemplos que posteriormente podremos eliminar (Consultar el laboratorio de **Creación y estructuración de una aplicación**).*

Editar el fichero `src/app/ejemplos/demos/demos.ts` para inyectar en el constructor el NotificationService y tener acceso al sistema de notificaciones (realizar el import correspondiente)

```ts
:
export class Demos {
  constructor(public vm: NotificationService) { }
```

Editar el fichero `src/app/ejemplos/demos/demos.html`, con la plantilla del componente, y sustituir el código por defecto por:

```html
<p>
  <input type="button" value="Error" (click)="vm.add('Esto es una notificación de error')" >
  <input type="button" value="Warn" (click)="vm.add('Esta notificación es un aviso', vm.NotificationType.warn)" >
  <input type="button" value="Info" (click)="vm.add('Solo una notificación informativa', vm.NotificationType.info)" >
  <input type="button" value="Log" (click)="vm.add('Para trazar con notificaciones', vm.NotificationType.log)" >
</p>
```

Ejecutar y probar. Abrir el inspector de código para verificar las salidas a consola.

## Paso 5. Versión modal del componente (Ampliación)

*Se puede crear una segunda vista sobre el ViewModel para disponer de una presentación alternativa.*

### Componente NotificationModal

Crear el nuevo componente de notificaciones dentro del módulo Layout:

```bash
ng generate component layout/NotificationModal
```

#### La clase del componente

Editar el fichero `src/app/layout/notification-modal/notification-modal.ts` con la clase del componente.

Como alternativa, se puede realizar una inyección funcional de `NotificationService`, que actuará como ViewModel de la vista, como atributo publico (realizar el import correspondiente), para permitir la vinculación desde la plantilla:

```ts
export class NotificationModal {
  VM = inject(NotificationService)
}
```

Guardar el fichero.

#### La plantilla del componente

Editar el fichero `src/app/layout/notification-modal/notification-modal.html`, con la plantilla del componente, y sustituir el código por defecto por:

```html
<style>
  .fondo-sombreado {
    position: fixed;
    background-color: black;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0.3;
  }
</style>
@if(VM.HayNotificaciones()){
  <div class="fondo-sombreado"></div>
  <div class="modal fade show" [style.display]="'block'" tabindex="-1"
    [attr.aria-hidden]="!VM.HayNotificaciones()">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-gradient text-white"
          [class]="{
              'bg-danger': VM.Listado()[0].Type === VM.NotificationType.error,
              'bg-warning': VM.Listado()[0].Type === VM.NotificationType.warn,
              'bg-primary': VM.Listado()[0].Type === VM.NotificationType.info,
              'bg-success': VM.Listado()[0].Type === VM.NotificationType.log
            }">
          <h5 class="modal-title" id="exampleModalLabel">Notificaciones</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
            (click)="VM.clear()"></button>
        </div>
        <div class="modal-body bg-light bg-gradient p-0">
          <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
            <symbol id="check-circle-fill" fill="currentColor" viewBox="0 0 16 16">
              <path
              d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
            </symbol>
            <symbol id="info-fill" fill="currentColor" viewBox="0 0 16 16">
              <path
                d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </symbol>
            <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
              <path
                d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </symbol>
            <symbol id="forbiben-circle-fill" fill="currentColor" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z" />
            </symbol>
          </svg>
          @for(item of VM.Listado(); track item.Id) {
            @switch (item.Type) {
              @case (VM.NotificationType.error) {
              <div class="m-0 p-3 alert alert-danger d-flex align-items-center rounded-0"
                role="alert">
                <svg class="bi flex-shrink-0 me-2 text-danger" width="24" height="24" role="img" aria-label="Danger:">
                  <use xlink:href="#forbiben-circle-fill" />
                </svg>
                <div>{{item.Message}}</div>
              </div>
              }
              @case (VM.NotificationType.warn) {
              <div class="m-0 p-3 alert alert-warning d-flex align-items-center rounded-0"
                role="alert">
                <svg class="bi flex-shrink-0 me-2 text-warning" width="24" height="24" role="img" aria-label="Danger:">
                  <use xlink:href="#exclamation-triangle-fill" />
                </svg>
                <div>{{item.Message}}</div>
              </div>
              }
              @case (VM.NotificationType.info) {
              <div class="m-0 p-3 alert alert-primary d-flex align-items-center rounded-0"
                role="alert">
                <svg class="bi flex-shrink-0 me-2 text-primary" width="24" height="24" role="img" aria-label="Info:">
                  <use xlink:href="#info-fill" />
                </svg>
                <div>{{item.Message}}</div>
              </div>
              }
              @default {
              <div class="m-0 p-3 alert alert-success d-flex align-items-center rounded-0" role="alert">
                <svg class="bi flex-shrink-0 me-2 text-success" width="24" height="24" role="img" aria-label="Log:">
                  <use xlink:href="#check-circle-fill" />
                </svg>
                <div>{{item.Message}}</div>
              </div>
              }
            }
          }
        </div>
        <div class="modal-footer bg-light bg-gradient">
          <button type="button" class="btn btn-secondary" (click)="VM.clear()">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
}
```

Guardar el fichero.

### Referenciado

Registrar en `src/app/layout/index.ts` los nuevos tipos creados.

```ts
:
export * from './notification-modal/notification-modal'
```

### Layout

*Sustituir en el componente principal el componente `Notification` por el nuevo componente creado.*

Editar el fichero `src/app/app.ts` con la clase y sustituir la declaración del componente `Notification` por `NotificationModal` (realizar el import de la clase correspondiente):

```ts
@Component({
  selector: 'app-root',
  imports: [ ... , NotificationModal, ],
  :
})
export class App {
```

Editar el fichero `src/app/app.html` con la plantilla para sustituir la etiqueta `<app-notification />` por la del nuevo componente:

```html
<app-header />
<app-notification-modal />
<div class="container-fluid" style="margin-top: 90px; margin-bottom: 50px">
  <main class="p-2">
    <router-outlet />
  </main>
</div>
<app-footer />
```

Guardar ficheros.

### Verificación

Ejecutar y probar. Abrir el inspector de código para verificar las salidas a consola.

## Ampliación: Servicios reactivos

*Se puede convertir el servicio en un observable que notifique a los suscriptores de la aparición de nuevas notificaciones.*

### Modificar el servicio NotificationService

Editar el fichero `src/app/common-services/notification.ts`.

Importar, de la biblioteca RxJS, el tipo base del observable:

```ts
import { Subject } from 'rxjs';
```

Completar clase `NotificationService` con la implementación de OnDestroy:

```ts
@Injectable({ providedIn: 'root'})
export class NotificationService implements OnDestroy {
```

Añadir, como atributo, el observable e inicializarlo (caliente):

```ts
private notificacion$ = new Subject<Notification>();
```

Exponer el observable, como propiedad de solo lectura, para que acepte suscriptores:

```ts
public get Notificacion() { return this.notificacion$; }
```

Modificar el método `Add` para que emita las notificaciones:

```ts
public add(msg: string, type: NotificationType = NotificationType.error) {
  if (!msg || msg === '') {
    this.logger.error('Falta el mensaje de notificación.');
    return;
  }
  const id = this.HayNotificaciones() ?
    (this.Listado()[this.Listado().length - 1].Id + 1) : 1;
  const n = new Notification(id, msg, type);
   this.listado.update(value => [...value, n]);
  this.notificacion$.next(n);
  // Redundancia: Los errores también se muestran en consola
  if (!environment.production && type === NotificationType.error) {
    this.logger.error(`NOTIFICATION: ${msg}`);
  }
}
```

Notificar en el destructor que el observable se ha completado:

```ts
  ngOnDestroy(): void {
    this.notificacion$.complete()
  }
```

### Crear un suscriptor

*Modificar el componente Demos para que se suscriba al servicio.*

Editar el fichero `src/app/ejemplos/demos/demos.ts`.

Añadir `OnInit` y `OnDestroy` a la lista de interfaces de la clase:

```ts
export class DemosComponent implements OnInit, OnDestroy {
```

Agregar un atributo que almacene al suscriptor para poder cancelar la suscripción al destruir el componente:

```ts
private suscriptor: Unsubscribable | undefined;
```

Al inicializar el componente, se crea la suscripción y se indica el tratamiento de las nuevas notificaciones:

```ts
ngOnInit(): void {
  this.suscriptor = this.vm.Notificacion.subscribe(n => {
    if (n.Type !== NotificationType.error) { return; }
    window.alert(`Suscripción: ${n.Message}`);
    this.vm.remove(this.vm.Listado().length - 1);
  });
}
```

Al destruir el componente se debe cancelar la suscripción para evitar fugas de memoria y de proceso:

```ts
ngOnDestroy(): void {
  if (this.suscriptor) {
    this.suscriptor.unsubscribe();
  }
}
```

### Verificación

Ejecutar y probar.

---
© JMA 2025
