/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, Injectable, Service, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from '@my-library';
import { Observable } from 'rxjs';
import { NotificationService, NavigationService, WindowService } from '../common-services';
import { ModoCRUD, RESTDAOService } from '../core';
import { AUTH_REQUIRED, AuthService } from '../security';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';

// Versión interface
export interface LibroModel {
  [index: string]: any;
  idLibro: number
  titulo: string
  autor?: string
  pais?: string
  fecha?: number
  paginas?: number
  wiki?: string
}

// Constante para la inicialización (Signal Forms)
export const init_value: LibroModel = {
  idLibro: 0,
  titulo: '',
}

@Injectable({
  providedIn: 'root'
})
export class LibrosDAOService extends RESTDAOService<LibroModel, number> {
  constructor() {
    super('libros', { context: new HttpContext().set(AUTH_REQUIRED, true) });
  }

  override page(page: number, rows: number = 20): Observable<{ page: number, pages: number, rows: number, list: LibroModel[] }> {
    return new Observable(subscriber => {
      const url = `${this.baseUrl}?_page=${page}&_rows=${rows}&_sort=titulo`
      this.http.get<any>(url, this.option).subscribe({
        next: data => subscriber.next({ page: data.number, pages: data.totalPages, rows: data.totalElements, list: data.content }),
        error: err => subscriber.error(err)
      })
    })
  }
}

@Service()
export class LibrosViewModelService {
  //#region Inyección de dependencias
  protected readonly notify = inject(NotificationService);
  protected readonly logger = inject(LoggerService);
  protected readonly dao = inject(LibrosDAOService);
  protected readonly navigation = inject(NavigationService);
  protected readonly router = inject(Router);
  readonly auth = inject(AuthService);
  //#endregion

  //#region Estado
  public readonly Modo: WritableSignal<ModoCRUD> = signal('list');
  public readonly Listado: WritableSignal<LibroModel[]> = signal([]);
  public readonly Elemento: WritableSignal<LibroModel> = signal({ ...init_value });
  protected idOriginal?: number;
  // protected listURL = '/libros';
  public readonly HOY = new Date().toISOString().substring(0, 10);
  // protected get DomainModel(): LibroModel { return this.Elemento() }
  protected get DomainModel(): LibroModel { return this.dao.blank2undefined(this.Elemento())}
  //#endregion

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
  protected readonly window = inject(WindowService);
  public delete(key: any): void {
    // if (!window.confirm('¿Seguro?')) { return; }

    this.dao.remove(key).subscribe({
      next: () => {
        // this.list()
        this.load()
      },
      error: err => this.handleError(err)
    });
    // this.window.confirm('¿Seguro?', () =>
    //   this.dao.remove(key).subscribe({
    //     next: () => {
    //       // this.list()
    //       this.load()
    //     },
    //     error: err => this.handleError(err)
    //   })
    // )
  }
  //#endregion

  //#region Limpieza
  clear() {
    this.Elemento.set({ ...init_value })
    this.idOriginal = undefined;
    this.Listado.set([]);
  }
  //#endregion

  //#region Comandos para las vistas de detalle y formularios
  public cancel(): void {
    this.clear()
    // this.router.navigateByUrl(this.listURL)
    this.navigation.back()
  }
  public send(): void {
    switch (this.Modo()) {
      case 'add':
        this.dao.add(this.DomainModel).subscribe({
          next: () => this.cancel(),
          error: err => this.handleError(err)
        });
        break;
      case 'edit':
        if (!this.idOriginal) {
          this.logger.error('Falta el identificador')
          return
        }
        this.dao.change(this.idOriginal, this.DomainModel).subscribe({
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

  //#region Tratamiento de errores
  handleError(err: HttpErrorResponse) {
    let message: string
    switch (err.status) {
      case 0: message = err.message; break;
      case 404: message = `ERROR: ${err.status} ${err.statusText}`; break;
      default:
        message = err.error?.['detail'] ?? err.error?.['title'] ?? err.message
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

  //#region Paginación
  readonly page = signal({ number: 0, totalPages: 0, totalRows: 0, rowsPerPage: 8 });
  load(page: number = -1) {
    if (page < 0) page = this.page().number;
    const rows = this.page().rowsPerPage;
    this.dao.page(page, rows).subscribe({
      next: (data) => {
        this.page.set({
          number: data.page,
          totalPages: data.pages,
          totalRows: data.rows,
          rowsPerPage: rows,
        });
        this.Listado.set(data.list);
        this.Modo.set('list');
      },
      error: (err) => this.handleError(err),
    });
  }
  pageChange(page: number = 0) {
    this.router.navigate([], { queryParams: { page } });
  }
  //#endregion

}

