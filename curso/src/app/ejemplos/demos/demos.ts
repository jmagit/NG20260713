/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommonModule, JsonPipe } from '@angular/common';
import { ChangeDetectorRef, Component, computed, effect, inject, resource, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CapitalizePipe, ElipsisPipe, ExecPipe, LoggerService, Sizer, StripTagsPipe } from '@my-library';
import { Unsubscribable } from 'rxjs';
import { NotificationService, NotificationType } from 'src/app/common-services';
import { Notification } from 'src/app/layout';
import { Card, FormButtons } from "src/app/common-component";
import { SimboloDecimal, Calculadora } from '../calculadora/calculadora';

@Component({
  selector: 'app-demos',
  imports: [JsonPipe, Notification, FormsModule, CommonModule, ExecPipe,
    ElipsisPipe, CapitalizePipe, StripTagsPipe, Sizer, Card, FormButtons, Calculadora],
  templateUrl: './demos.html',
  styleUrl: './demos.css',
  // changeDetection: ChangeDetectionStrategy.Eager,
  // providers: [ NotificationService ]
})
export class Demos {
  public vm = inject(NotificationService)
  public logger = inject(LoggerService)

  readonly nombre = signal<string>('mundo')
  readonly fontSize = signal(24)
  readonly listado = signal([
    {id: 1, nombre: 'Madrid'},
    {id: 2, nombre: 'barcelona'},
    {id: 3, nombre: 'SEVILLA'},
    {id: 4, nombre: 'ciudad Real'},
  ])
  readonly idProvincia = signal(2)
  readonly total = computed(() => this.listado().length)

  fecha = new Date('2026-07-15')

  get Fecha(): string { return this.fecha.toISOString().substring(0, 10)}
  set Fecha(value: string) {
    const f = new Date(value)
    if(f.toString() === 'Invalid date' || f === this.fecha) return
    this.fecha = f
  }

  readonly resultado = signal('')
  readonly visible = signal(true)
  readonly estetica = signal({ importante: true, error: false, urgente: true })

  saluda() {
    this.resultado.set(`Hola ${this.nombre()}`)
  }

  despide() {
    this.resultado.set(`Adios ${this.nombre()}`)
  }

  di(algo: string) {
    this.resultado.set(`Dice ${algo}`)
  }

  cambia() {
    this.visible.update(value => !value)
    this.estetica.update(value => ({...value, importante: !value.importante, error: !value.error}))
  }

  constructor() {
    this.calcula = this.calcula.bind(this)
  }
  contador = 0
  calcula(a: number, b: number): number {
    this.logger.warn(`Calculos ${++this.contador}`)
    return a + b
  }

  add(provincia: string) {
    const id = this.listado()[this.listado().length - 1].id + 1
    // mala practica
    // this.listado().push({id, nombre: provincia})
    // this.listado.set([...this.listado()])
    this.listado.update(value => [...value, {id, nombre: provincia}])
    this.idProvincia.set(id)
  }

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

  // Ejemplo de Calculadora

  idiomas = signal([
    { codigo: 'en-US', region: 'USA' },
    { codigo: 'es', region: 'España' },
    { codigo: 'pt', region: 'Portugal' },
  ]).asReadonly();
  idioma = signal(this.idiomas()[0].codigo);
  calculos = signal<Calculo[]>([]);
  valCalculadora = signal(666);
  simbolo: SimboloDecimal = ','

  ponResultado(origen: string, valor: number) {
    this.calculos.update(value => [ ...value, {
      pos: this.calculos.length + 1,
      origen,
      valor: +valor
    }]);
  }
}
interface Calculo {
  pos: number
  origen: string
  valor: number
}
