# Laboratorio Angular 22 - Mantenimiento de Contactos

## Objetivo del laboratorio

Vamos a crear un sistema de mantenimiento de la entidad contactos (CRUD: Create, Read, Update, Delete).

Para ello crearemos un módulo que contenga los diferentes artefactos necesarios para la implementación.

Al módulo añadiremos un par de servicios: el servicio DAO (Data Access Object) que centralizará el acceso a los datos en el servidor, así como su persistencia, y un servicio ViewModel que gestionará la lógica de presentación.

Así mismo, añadiremos al módulo una serie de componentes que actuaran de vistas.

## Paso 1. Módulo Core

*El  módulo de Core contiene los tipos de datos, interface, clases base y otros elementos de uso común en el código de todo el proyecto.*

### Módulo

Crear la carpeta del módulo de Core:

```bash
md src/app/core
```

### Tipos

Crear y editar el fichero `src/app/core/tipos.ts`.

Añadir:

```ts
export type ModoCRUD = 'list' | 'add' | 'edit' | 'view' | 'delete';
```

### Servicios

Crear y editar el fichero `src/app/core/rest-dao-services.ts`.

Añadir y resolver las importaciones (vigilar que se importe desde `environments/environment` y no desde `environments/environment.development`):

```ts
export abstract class RESTDAOService<T, K> {
  protected readonly baseUrl = environment.apiURL;
  protected http = inject(HttpClient)

  constructor(entidad: string, protected option = {}) {
    if(entidad.toLocaleLowerCase().startsWith('http'))
      this.baseUrl = entidad
    else
      this.baseUrl += entidad;
  }

  query(extras = {}): Observable<T[]> {
    return this.http.get<T[]>(this.baseUrl, Object.assign({}, this.option, extras));
  }
  get(id: K, extras = {}): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`, Object.assign({}, this.option, extras));
  }
  add(item: T, extras = {}): Observable<T> {
    return this.http.post<T>(this.baseUrl, item, Object.assign({}, this.option, extras));
  }
  change(id: K, item: T, extras = {}): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${id}`, item, Object.assign({}, this.option, extras));
  }
  remove(id: K, extras = {}): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${id}`, Object.assign({}, this.option, extras));
  }
}
```

### Referenciado

Crear y editar el fichero `src/app/core/index.ts`.

Añadir:

```ts
export * from './tipos'
export * from './rest-dao-services'
```

## Paso 2. Módulo Contactos

### Módulo

Crear el módulo de Contactos:

```bash
md src/app/contactos
```

### Servicios

Crear y editar el fichero `src/app/contactos/servicios.ts`.

Añadir el modelo (**Model**):

```ts
// Versión interface
export interface ContactoModel {
  [index: string]: any;
  id?: number
  tratamiento?: string
  nombre: string
  apellidos?: string
  telefono?: string
  email?: string
  sexo?: string
  nacimiento?: string
  avatar?: string
  conflictivo?: boolean
  icono?: string
}

// Versión clase
export class Contacto implements ContactoModel {
  [index: string]: any;
  constructor(
    public id: number = 0,
    public nombre: string,
    public tratamiento?: string,
    public apellidos?: string,
    public telefono?: string,
    public email?: string,
    public sexo: string = 'H',
    public nacimiento?: string,
    public avatar?: string,
    public conflictivo: boolean = false,
  ) { }
}

// Constante para la inicialización (Signal Forms)
const init_value: ContactoModel = {
  id: 0,
  // tratamiento: 'Sr.',
  nombre: '',
  // apellidos: '',
  // telefono: '',
  // email: '',
  sexo: 'H',
  // nacimiento: '',
  // avatar: '',
  conflictivo: false,
  // icono: '',
}
```

Añadir el servicio de acceso a datos en el servidor (backend): extiende el DAO genérico, resuelve los tipos y lo amplia con el método load que obtiene los datos paginados.

```ts
@Injectable({
  providedIn: 'root'
})
export class ContactosDAOService extends RESTDAOService<ContactoModel, number> {
  constructor() {
    super('contactos');
  }

  page(page: number, rows: number = 20): Observable<{ page: number, pages: number, rows: number, list: ContactoModel[] }> {
    return new Observable(subscriber => {
      const url = `${this.baseUrl}?_page=${page}&_rows=${rows}&_sort=nombre,apellidos`
      this.http.get<any>(url, this.option).subscribe({
        next: data => subscriber.next({ page: data.number, pages: data.totalPages, rows: data.totalElements, list: data.content }),
        error: err => subscriber.error(err)
      })
    })
  }
}
```

Añadir el servicio que representa el **ViewModel**.

```ts
@Injectable({
  providedIn: 'root'
})
export class ContactosViewModelService {
}
```

La clase necesita los siguientes atributos:

- Un modo para saber el estado de la operación (binding).
- Una colección con el listado de los elementos que se están visualizando (binding).
- Una referencia al elemento que se está visualizando o editando (binding).
- Una cache del identificador del elemento que originalmente se solicitó para su edición.
- Una referencia a la ruta principal del dominio.

Añadir los atributos de la clase ContactosViewModelService:

```ts
  //#region Estado
  public readonly Modo: WritableSignal<ModoCRUD> = signal('list');
  public readonly Listado: WritableSignal<ContactoModel[]> = signal([]);
  public readonly Elemento: WritableSignal<ContactoModel> = signal({ ...init_value });
  protected idOriginal?: number;
  protected listURL = '/contactos';
  public readonly HOY = new Date().toISOString().substring(0, 10);
  //#endregion
```

Añadir el constructor e inyectar dependencias:

```ts
  constructor(
    protected notify: NotificationService,
    protected logger: LoggerService,
    protected dao: ContactosDAOService,
    public auth: AuthService,
    protected router: Router
    // protected navigation: NavigationService
  ) { }
```

Para evitar un constructor con demasiados parámetros se puede sustituir por inyecciones funcionales:

```ts
  //#region Inyección de dependencias
  protected readonly notify = inject(NotificationService);
  protected readonly logger = inject(LoggerService);
  protected readonly dao = inject(ContactosDAOService);
  protected readonly navigation = inject(NavigationService);
  protected readonly router = inject(Router);
  readonly auth = inject(AuthService);
  //#endregion
```

Añadir el comando para obtener el listado a mostrar:

```ts
  //#region Recuperar lista de elementos
  public list(): void {
    this.dao.query().subscribe({
      next: data => {
        this.Listado.set(data);
        this.Modo.set('list');
      },
      error: err => this.handleError(err)
    });
  }
  //#endregion
```

Añadir los comandos para preparar las operaciones con la entidad:

```ts
  //#region Comandos con la entidad
  public add(): void {
    this.Elemento.set({ ...init_value });
    this.Modo.set('add');
  }
  public edit(key: any): void {
    this.dao.get(key).subscribe({
      next: data => {
        this.Elemento.set(data);
        this.idOriginal = key;
        this.Modo.set('edit');
      },
      error: err => this.handleError(err)
    });
  }
  public view(key: any): void {
    this.dao.get(key).subscribe({
      next: data => {
        this.Elemento.set(data);
        this.Modo.set('view');
      },
      error: err => this.handleError(err)
    });
  }
  public delete(key: any): void {
    if (!window.confirm('¿Seguro?')) { return; }

    this.dao.remove(key).subscribe({
      next: () => {
        this.list()
        // this.load()
      },
      error: err => this.handleError(err)
    });
  }
  //#endregion
```

Añadir el comando para liberar la memoria cuando ya no sea necesaria:

```ts
  //#region Limpieza
  clear() {
    this.Elemento.set({ ...init_value })
    this.idOriginal = undefined;
    this.Listado.set([]);
  }
  //#endregion
```

Añadir los comandos para cerrar la vista de detalle o el formulario:

```ts
  //#region Comandos para las vistas de detalle y formularios
  public cancel(): void {
    this.clear()
    this.router.navigateByUrl(this.listURL)
    // this.navigation.back()
  }
  public send(): void {
    switch (this.Modo()) {
      case 'add':
        this.dao.add(this.Elemento()).subscribe({
          next: () => this.cancel(),
          error: err => this.handleError(err)
        });
        break;
      case 'edit':
        if (!this.idOriginal) {
          this.logger.error('Falta el identificador')
          return
        }
        this.dao.change(this.idOriginal, this.Elemento()).subscribe({
          next: () => this.cancel(),
          error: err => this.handleError(err)
        });
        break;
      case 'view':
        this.cancel();
        break;
    }
  }
  //#endregion
```

Añadir los manipuladores de errores para su notificación:

```ts
//#region Tratamiento de errores
handleError(err: HttpErrorResponse) {
  let message: string
  switch (err.status) {
    case 0: message = err.message; break;
    case 404: message = `ERROR: ${err.status} ${err.statusText}`; break;
    default:
      message = err.error?.['detail'] ?? err.error?.['title'] ?? ''
      message = `ERROR: ${err.status} ${err.statusText}.${message ? ` Detalles: ${message}` : ''}`
      if (err.error?.['errors']) {
        for (const cmp in err.error?.['errors'])
          message += ` ${cmp}: ${err.error?.['errors'][cmp]}.`
      }
      break;
  }
  this.notify.add(message)
}
imageErrorHandler(event: Event, item: any) {
  (event.target as HTMLImageElement).src = `/images/user-not-found-${item.sexo === 'H' ? 'male' : 'female'}.png`
}
//#endregion
```

Añadir la gestión de la paginación:

```ts
//#region Paginado
readonly page = signal({ number: 0, totalPages: 0, totalRows: 0, rowsPerPage: 8 })
load(page: number = -1) {
  if (page < 0) page = this.page().number
  const rows = this.page().rowsPerPage
  this.dao.page(page, rows).subscribe({
    next: data => {
      this.page.set({ number: data.page, totalPages: data.pages, totalRows: data.rows, rowsPerPage: rows })
      this.Listado.set(data.list);
      this.Modo.set('list');
    },
    error: err => this.handleError(err)
  })
}
pageChange(page: number = 0) {
  this.router.navigate([], { queryParams: { page } })
}
//#endregion
```

### Componentes

Crear y editar el fichero `src/app/contactos/componentes.ts` para las clases de los componentes.

Crear el fichero `src/app/contactos/componentes.css` con las clases de estilo comunes a los componentes.

Crear los siguientes ficheros para las plantillas.

- `src/app/contactos/tmpl-list.html`
- `src/app/contactos/tmpl-form.html`
- `src/app/contactos/tmpl-view.html`

Editar el fichero `src/app/contactos/componentes.ts` y añadir las clases de los componentes (resolver las importaciones).

```ts
@Component({
    selector: 'app-contactos-list',
    templateUrl: './tmpl-list.html',
    styleUrls: ['./componentes.css'],
    imports: [RouterLink, Paginator]
})
export class ContactosList implements OnChanges, OnDestroy {
  readonly VM = inject(ContactosViewModelService);
  readonly page = input(0);

  ngOnChanges(_changes: SimpleChanges): void {
    this.VM.list()
    // this.VM.load(this.page())
  }

  ngOnDestroy(): void { this.VM.clear(); }
}

@Component({
    selector: 'app-contactos-add',
    templateUrl: './tmpl-form.html',
    styleUrls: ['./componentes.css'],
    imports: [FormsModule, TypeValidator, ErrorMessagePipe]
})
export class ContactosAdd implements OnInit {
  readonly VM = inject(ContactosViewModelService);

  ngOnInit(): void {
    this.VM.add();
  }
}

@Component({
    selector: 'app-contactos-edit',
    templateUrl: './tmpl-form.html',
    styleUrls: ['./componentes.css'],
    imports: [FormsModule, TypeValidator, ErrorMessagePipe]
})
export class ContactosEdit implements OnInit, OnDestroy {
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  readonly VM = inject(ContactosViewModelService);

  private obs$?: Subscription;

  ngOnInit(): void {
    this.obs$ = this.route.paramMap.subscribe(
      (params: ParamMap) => {
        const id = parseInt(params?.get('id') ?? '');
        if (id) {
          this.VM.edit(id);
        } else {
          this.router.navigate(['/404.html']);
        }
      });
  }
  ngOnDestroy(): void {
    this.obs$!.unsubscribe();
  }
}

@Component({
    selector: 'app-contactos-view',
    templateUrl: './tmpl-view.html',
    styleUrls: ['./componentes.css'],
    imports: [DatePipe]
})
export class ContactosView {
  protected readonly router = inject(Router);
  readonly VM = inject(ContactosViewModelService);
  readonly id = input.required<string>();

  constructor() {
    effect(() => {
      const id = +this.id();
      if (id) {
        this.VM.view(+id);
      } else {
        this.router.navigate(['/404.html']);
      }
    });
  }
}
```

Guardar el fichero `src/app/contactos/componentes.ts` con los cambios realizados.

Crear el fichero `src/app/contactos/index.ts`, editar y añadir:

```ts
export * from './servicios';
export * from './componentes';
```

Crear `src/app/contactos/contactos-module.ts` para registrar los componentes y sus rutas:

```ts
export const routes: Routes = [
  { path: '', component: ContactosList },
  { path: 'add', component: ContactosAdd },
  { path: ':id/edit', component: ContactosEdit },
  { path: ':id', component: ContactosView },
  { path: ':id/:kk', component: ContactosView },
]
```

### Plantillas

Editar el fichero `src/app/contactos/tmpl-list.html` y sustituir el código por defecto por:

```html
<table class="table table-striped table-hover">
  <thead>
    <tr class="table-info">
      <th class="display-4">Lista de contactos</th>
      <th class="text-end">
        <button class="btn btn-success" routerLink="add"><i class="fas fa-plus"></i> Añadir</button>
      </th>
    </tr>
  </thead>
  <tbody>
    @for (item of VM.Listado(); track item.id) {
    <tr>
        <td>
          <div class="container">
            <div class="row">
              <div class="col-md-2">
                <img class="rounded-circle float-left" src="{{item.avatar ?? (item.sexo === 'H' ? '/images/user-not-found-male.png' : '/images/user-not-found-female.png') }}"
                  alt="Foto de {{item.nombre}} {{item.apellidos}}" width="75" height="75" (error)="VM.imageErrorHandler($event, item)">
              </div>
              <div class="col-md-10">
                <a class="btn btn-link btn-lg px-0" routerLink="{{item.id}}/{{item.nombre}}-{{item.apellidos}}">
                  {{item.tratamiento}} {{item.nombre}} {{item.apellidos}}</a>
                <br>
                <b>Tlfn.:</b> {{item.telefono}} <b>Correo:</b> {{item.email}}
              </div>
            </div>
          </div>
        </td>
        <td class="align-middle text-end">
          <div class="btn-group" role="group">
            <button class="btn btn-success" [routerLink]="[item.id, 'edit']"><i class="fas fa-pen"></i></button>
            <button class="btn btn-danger" (click)="VM.delete(item.id)"><i class="far fa-trash-alt"></i></button>
          </div>
      </td>
      </tr>
  }
  </tbody>
</table>
```

Editar el fichero `src/app/contactos/tmpl-view.html` y sustituir el código por defecto por:

```html
<h1>Contacto</h1>
@if(VM.Elemento()) {
<div class="row">
  <div class="col-xs-12 col-sm-6 col-md-6">
      <div class="well well-sm">
          <div class="row">
              <div class="col-sm-6 col-md-4">
                  <img src="{{VM.Elemento().avatar}}" (error)="VM.imageErrorHandler($event, VM.Elemento())"
                        alt="Foto de {{VM.Elemento().nombre}} {{VM.Elemento().apellidos}}" class="rounded" />
              </div>
              <div class="col-sm-6 col-md-8">
                  <h4>{{VM.Elemento().tratamiento}} {{VM.Elemento().nombre}} {{VM.Elemento().apellidos}}</h4>
                  <p [hidden]="!VM.Elemento().conflictivo"><small class="text-danger">
                        <i class="fas fa-skull-crossbones mr-2"></i>Persona conflictiva</small></p>
                  <p>
                      <i class="fas fa-phone-alt mr-2"></i>{{VM.Elemento().telefono}}
                      <br />
                      <i class="fas fa-envelope mr-2"></i>
                        <a href="mailto:{{VM.Elemento().email}}">{{VM.Elemento().email}}</a>
                      <br />
                      <i class="fas fa-gifts mr-2"></i>{{VM.Elemento().nacimiento | date:'dd/MM/yyyy'}}
                  </p>
                  <div class="btn-group">
                    <div class="btn-group">
                        <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                            <span class="caret"></span><span class="sr-only">Social</span>
                        </button>
                        <ul class="dropdown-menu" role="menu">
                            <li><a class="dropdown-item" href="#" target="_blank">Twitter</a></li>
                            <li><a class="dropdown-item" href="https://plus.google.com/+Jquery2dotnet/posts" target="_blank">Google +</a></li>
                            <li><a class="dropdown-item" href="https://www.facebook.com/jquery2dotnet" target="_blank">Facebook</a></li>
                            <li class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" target="_blank">Github</a></li>
                        </ul>
                    </div>
                    <input class="btn btn-secondary" type="button" value="Volver" (click)="VM.cancel()">
                  </div>
              </div>
          </div>
      </div>
  </div>
</div>
} @else {
  <h2>Sin datos</h2>
}
```

Editar el fichero `src/app/contactos/tmpl-form.html` y sustituir el código por defecto por:

```html
<h1>Contacto</h1>
@if(VM.Elemento()) {
<form #miForm="ngForm" class="row gy-2 gx-2 align-items-start">
  @if (VM.Modo() === 'add') {
    <div class="form-floating col-md-2">
      <input class="form-control" [class.is-invalid]="id.invalid && miForm.dirty" type="number" name="id" id="id" [(ngModel)]="VM.Elemento().id"
      #id="ngModel" required min="0" placeholder=" ">
      <label for="id">Código:</label>
      <output class="invalid-feedback" [hidden]="id.valid">{{id.errors | errormsg}}</output>
    </div>
  } @else {
    <div class="col-md-2">
      <label class="form-label-sm" for="id">Código:</label>
      <output class="d-block" [textContent]="VM.Elemento().id"></output>
    </div>
  }
  <div class="form-floating col-md-2">
    <select class="form-control form-select" name="tratamiento" id="tratamiento"
       [(ngModel)]="VM.Elemento().tratamiento" #tratamiento="ngModel">
      <option>Sr.</option>
      <option>Sra.</option>
      <option>Srta.</option>
      <option>Dr.</option>
      <option>Dra.</option>
      <option>Ilmo.</option>
      <option>Ilma.</option>
      <option>Excmo.</option>
      <option>Excma.</option>
    </select>
    <label for="tratamiento">Tratamiento:</label>
  </div>
  <div class="form-floating col-md-4">
    <input class="form-control" [class.is-invalid]="nombre.invalid" type="text" name="nombre" id="nombre"
       [(ngModel)]="VM.Elemento().nombre" #nombre="ngModel" required minlength="2"
       maxlength="50" placeholder=" ">
    <label for="nombre">Nombre:</label>
    <output class="invalid-feedback" [hidden]="nombre.valid">{{nombre.errors | errormsg}}</output>
  </div>
  <div class="form-floating col-md-4">
    <input class="form-control" [class.is-invalid]="apellidos.invalid" type="text" name="apellidos" id="apellidos"
       [(ngModel)]="VM.Elemento().apellidos" #apellidos="ngModel" minlength="2" maxlength="50"
       placeholder=" ">
    <label for="apellidos">Apellidos:</label>
    <output class="invalid-feedback" [hidden]="apellidos.valid">{{apellidos.errors | errormsg}}</output>
  </div>
  <div class="form-floating col-md-3 col-lg-2">
    <input class="form-control" [class.is-invalid]="telefono.invalid" type="tel" name="telefono" id="telefono"
       [(ngModel)]="VM.Elemento().telefono" #telefono="ngModel" pattern="^(\d{3}\s){2}\d{3}$" placeholder=" ">
    <label class="form-label" for="telefono">Teléfono:</label>
    <output class="invalid-feedback" [hidden]="telefono.valid">{{telefono.errors | errormsg:"El formato debe ser: 555 999 999"}}</output>
  </div>
  <div class="form-floating  col-md-6 col-lg-4">
    <input class="form-control" [class.is-invalid]="email.invalid" type="email" name="email" id="email" [(ngModel)]="VM.Elemento().email"
       #email="ngModel" email maxlength="100" placeholder=" ">
    <label class="form-label" for="email">Correo:</label>
    <output class="invalid-feedback" [hidden]="email.valid">{{email.errors | errormsg}}</output>
  </div>
  <div class="form-floating col-md-3 col-lg-2">
    <input class="form-control" [class.is-invalid]="nacimiento.invalid" type="date" name="nacimiento" id="nacimiento"
       [(ngModel)]="VM.Elemento().nacimiento" #nacimiento="ngModel" placeholder=" " [max]="VM.HOY">
    <label class="form-label" for="nacimiento">F. Nacimiento:</label>
    <output class="invalid-feedback" [hidden]="nacimiento.valid">{{nacimiento.errors | errormsg}}</output>
  </div>
  <div class="col-md-4 col-lg-2">
    <div class="col-form-label-sm d-inline d-lg-block">Sexo:</div>
    <div class="ms-2 d-inline">
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="sexo" id="sexo1" value="H"
       [(ngModel)]="VM.Elemento().sexo">
        <label class="form-check-label" for="sexo1">Hombre</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="radio" name="sexo" id="sexo2" value="M"
       [(ngModel)]="VM.Elemento().sexo">
        <label class="form-check-label" for="sexo2">Mujer</label>
      </div>
    </div>
  </div>
  <div class="col-md-4 col-lg-2">
    <div class="col-form-label-sm d-inline d-lg-block">Situación:</div>
    <div class="ms-2 form-check form-check-inline form-switch">
      <input class="form-check-input" type="checkbox" id="conflictivo" name="conflictivo"
        [(ngModel)]="VM.Elemento().conflictivo" #conflictivo="ngModel">
      <label class="form-check-label" for="conflictivo">Conflictivo</label>
    </div>
  </div>
  <div class="form-floating col-md-12">
    <input class="form-control" [class.is-invalid]="avatar.invalid" type="url" name="avatar" id="avatar"
       [(ngModel)]="VM.Elemento().avatar" #avatar="ngModel" maxlength="500" placeholder=" ">
    <label class="form-label" for="avatar">Avatar:</label>
    <output class="invalid-feedback" [hidden]="avatar.valid">{{avatar.errors | errormsg}}</output>
  </div>
  <div class="mt-2 btn-group">
    <input type="button" class="btn btn-success" value="Enviar" (click)="VM.send()"
       [disabled]="miForm.invalid">
    <input type="button" class="btn btn-info" value="Volver" (click)="VM.cancel()">
  </div>
</form>
} @else {
  <h2>Sin datos</h2>
}
```

## Paso 3. Rutas

*Para registrar las rutas elegir una de las dos opciones.*

Editar `src/app/app.routes.ts`:

### Registro de rutas (opción Carga Ansiosa)

Añadir, en el array `routes`, las rutas a los componentes recién creados (agregar las importaciones necesarias).

```ts
{ path: 'contactos', children: [
  { path: '', component: ContactosList },
  { path: 'add', component: ContactosAdd },
  { path: ':id/edit', component: ContactosEdit },
  { path: ':id', component: ContactosView },
  { path: ':id/:kk', component: ContactosView },
]},
{ path: 'alysia/baxendale', redirectTo: '/contactos/43' },
```

### Registro de rutas (opción Carga Perezosa)

Añadir, en el array `routes`, las rutas a los componentes del módulo recién creado.

```ts
{ path: 'contactos', loadChildren: () => import('./contactos/contactos-module').then(mod => mod.routes) },
{ path: 'alysia/baxendale', redirectTo: '/contactos/43' },
```

### Menú

Da de alta en el array del menú generado por `generaMenu()` las opciones:

```ts
{ texto: 'Contactos', icono: 'fa-solid fa-address-book', path: '/contactos', visible: true },
{ texto: 'Alysia', icono: 'fa-solid fa-address-book', path: '/alysia/baxendale', visible: true },
```

## Paso 4. Probar la aplicación

Ejecutar el servidor de desarrollo en el terminal, si no está arrancado, y explorar la aplicación en el navegador.

> [!IMPORTANT]
> Verificar que el servidor con los servicios API REST debe estar también en ejecución.

---
© JMA 2025
