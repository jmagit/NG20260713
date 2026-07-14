/* eslint-disable @typescript-eslint/no-unused-vars */
import { JsonPipe } from '@angular/common';
import { ChangeDetectorRef, Component, computed, effect, inject, resource, signal } from '@angular/core';
import { LoggerService } from '@my-library';
import { Unsubscribable } from 'rxjs';
import { NotificationService, NotificationType } from 'src/app/common-services';
import { Notification } from 'src/app/layout';

@Component({
  selector: 'app-demos',
  imports: [JsonPipe, Notification],
  templateUrl: './demos.html',
  styleUrl: './demos.css',
  // changeDetection: ChangeDetectionStrategy.Eager,
  // providers: [ NotificationService ]
})
export class Demos {
  public vm = inject(NotificationService)
  public logger = inject(LoggerService)

  // ejemplo del servicio NotificationService
  // private suscriptor: Unsubscribable | undefined;
  // ngOnInit(): void {
  //   this.suscriptor = this.vm.Notificacion.subscribe(n => {
  //     if (n.Type !== NotificationType.error) { return; }
  //     window.alert(`Suscripción: ${n.Message}`);
  //     this.vm.remove(this.vm.Listado().length - 1);
  //   });
  // }
  // ngOnDestroy(): void {
  //   if (this.suscriptor) {
  //     this.suscriptor.unsubscribe();
  //   }
  // }
  // constructor() {
  //   effect(()=> {
  //     if(this.vm.HayNotificaciones() && this.vm.Listado()[this.vm.Listado().length - 1].Type === NotificationType.error) {
  //       window.alert(`Efecto secundarios: ${this.vm.Listado()[this.vm.Listado().length - 1].Message}`);
  //       this.vm.remove(this.vm.Listado().length - 1);
  //     }
  //   })
  // }

  // ejemplo del servicio LoggerService
  // constructor(logger: LoggerService) {
  //   logger.error('esto es un error')
  //   logger.warn('esto es un warn')
  //   logger.info('esto es un info')
  //   logger.log('esto es un log')
  // }
  // ejemplo de señales
  // readonly conSignal = signal(0)
  // readonly doble = computed(() => this.conSignal() * 2)
  // sinSignal = 0

  // intervalos: number[] = []
  // changeDetectorRef = inject(ChangeDetectorRef)
  // constructor() {
  //   this.intervalos.push(setInterval(() => this.conSignal.update(value => value + 1), 3_000))
  //   this.intervalos.push(setInterval(() => {
  //     this.sinSignal++;
  //     console.warn(this.sinSignal)
  //     this.changeDetectorRef.detectChanges()
  //   }, 1_000))
  //   effect(() => {
  //     console.log(`Contador: ${this.conSignal()}`)
  //   })
  // }

  // ngOnDestroy() {
  //   this.intervalos.forEach(intervalo => clearInterval(intervalo))
  // }

  // addSignal() {
  //   // this.conSignal.set(this.conSignal() + 1)
  //   this.conSignal.update(value => value + 1)
  // }
  // addSinSignal() {
  //   this.sinSignal++
  // }

  // readonly file = signal<Blob | undefined>(undefined)
  // readonly lector = resource({
  //   params: () => ({ file: this.file() }),
  //   loader: ({ params }) => new Promise((resolve, reject) => {
  //     if (!params.file) reject('Falta el fichero')
  //     const reader = new FileReader();
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = () => reject(reader.error);
  //     reader.readAsText(params.file as Blob);
  //   })
  // })

}
