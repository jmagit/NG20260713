import { computed, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { LoggerService } from '@my-library';

export enum NotificationType { error = 'error', warn = 'warn', info = 'info', log = 'log' }

export class Notification {
  constructor(private id: number, private message: string,
    private type: NotificationType) { }
  public get Id() { return this.id; }
  public get Message() { return this.message; }
  public get Type() { return this.type; }
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService implements OnDestroy {
  public readonly NotificationType = NotificationType;

  private readonly listado: WritableSignal<Notification[]> = signal([]);
  public readonly HayNotificaciones = computed(() => this.listado().length > 0);

  private notificacion$ = new Subject<Notification>();

  constructor(private logger: LoggerService) { }

  public get Listado() { return this.listado.asReadonly(); }

  public get Notificacion() { return this.notificacion$; }

  public add(msg: string, type: NotificationType = NotificationType.error) {
    if (!msg || msg.trim() === '') {
      this.logger.error('Falta el mensaje de notificación.');
      return;
    }
    const id = this.HayNotificaciones() ?
      (this.listado()[this.listado().length - 1].Id + 1) : 1;
    const n = new Notification(id, msg, type);
    this.listado.update(value => [...value, n]);
    this.notificacion$.next(n);
    // Redundancia: Los errores también se muestran en consola
    if (!environment.production && type === NotificationType.error) {
      this.logger.error(`NOTIFICATION: ${msg}`);
    }
  }
  public remove(index: number) {
    if (index < 0 || index >= this.listado().length) {
      this.logger.error('Index out of range.');
      return;
    }
    this.listado.update(value => value.filter((_item, ind) => ind !== index));
  }
  public removeById(id: number) {
    this.listado.update(value => value.filter((item) => item.Id !== id));
  }
  public clear() {
    if (this.HayNotificaciones())
      this.listado.set([]);
  }
  ngOnDestroy(): void {
    this.notificacion$.complete()
  }
}
