// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component, Input, OnInit, OnChanges, SimpleChanges, HostListener, Inject, signal, input, effect, output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SlicePipe } from '@angular/common';
import { NotificationService, NotificationType } from '../../common-services';
import { ToComaDecimalPipe, LoggerService } from '@my-library';

export type SimboloDecimal = '.' | ',';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'calculadora',
  templateUrl: './calculadora.html',
  styleUrls: ['./calculadora.scss'],
  imports: [SlicePipe, ToComaDecimalPipe,],
  host: { 'tabIndex': '0' }
})
export class Calculadora implements OnInit, OnChanges {
  public readonly Math = Math;

  private acumulado = 0;
  private operador = '+';
  private limpiar = true;
  public readonly Pantalla = signal('0')
  public readonly Resumen = signal('');

  public readonly init = input<number>(0)
  public readonly updated = output<number>();

  constructor(private logger: LoggerService, private notify: NotificationService) {
    this.inicia();
    effect(() => {
      this.ponOperando((this.init() ?? 0).toString());
    })
  }

  private separadorDecimal: SimboloDecimal = '.';
  get SeparadorDecimal() { return this.separadorDecimal; }
  @Input() set 'separador-decimal'(value: SimboloDecimal) {
    if (value !== this.separadorDecimal && (value === '.' || value === ',')) {
      this.separadorDecimal = value;
    } else if (value) {
      this.logger.error('Separador decimal no reconocido.');
    }
  }

  inicia(): void {
    this.acumulado = 0;
    this.operador = '+';
    this.Pantalla.set('0');
    this.Resumen.set('');
    this.limpiar = true;
  }

  ponDigito(value: number | string): void {
    if (typeof (value) !== 'string')
      value = value.toString();
    if (value.length != 1 || value < '0' || value > '9') {
      this.logger.error('No es un valor numérico.');
      return;
    }
    if (this.limpiar || this.Pantalla() == '0') {
      this.Pantalla.set(value);
      this.limpiar = false;
    } else
      this.Pantalla.update(old => old + value);
  }

  ponOperando(value: number | string): void {
    if (typeof value === "number" || (!Number.isNaN(parseFloat(value)) && parseFloat(value).toString() == value)) {
      this.Pantalla.set(value.toString());
      this.limpiar = false;
    } else {
      this.logger.error('No es un valor numérico.');
    }
  }

  ponComa(): void {
    if (this.limpiar) {
      this.Pantalla.set('0.');
      this.limpiar = false;
    } else if (this.Pantalla().indexOf('.') === -1) {
      this.Pantalla.update(old => old + '.');
    } else {
      this.notify.add('Ya está la coma', NotificationType.warn)
      // this.logger.warn('Ya está la coma');
    }
  }

  borrar(): void {
    if (this.limpiar || this.Pantalla().length == 1 || (this.Pantalla().length == 2 && this.Pantalla().startsWith('-'))) {
      this.Pantalla.set('0');
      this.limpiar = false;
    } else
      this.Pantalla.update(old => old.substring(0, old.length - 1));
  }

  cambiaSigno(): void {
    this.Pantalla.update(old => (-old).toString());
    if (this.limpiar) {
      this.acumulado = -this.acumulado;
    }
  }

  calcula(value: string): void {
    if ('+-*/='.indexOf(value) == -1) {
      this.logger.error(`Operación no soportada: ${value}`);
      return;
    }

    const operando = parseFloat(this.Pantalla());
    switch (this.operador) {
      case '+':
        this.acumulado += operando;
        break;
      case '-':
        this.acumulado -= operando;
        break;
      case '*':
        this.acumulado *= operando;
        break;
      case '/':
        this.acumulado /= operando;
        break;
    }
    // Con eval()
    // acumulado = eval (acumulado + operador + miPantalla);
    // Number: double-precision IEEE 754 floating point.
    // 9.9 + 1.3, 0.1 + 0.2, 1.0 - 0.9
    this.Pantalla.set(parseFloat(this.acumulado.toPrecision(15)).toString());
    // this.Pantalla.set(this.acumulado.toString());
    this.Resumen.set(value == '=' ? '' : (`${this.Pantalla()} ${value}`));
    this.updated.emit(this.acumulado);
    this.operador = value;
    this.limpiar = true;
  }

  // @Input() init: string | number = '0';

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    // if (this.init()) {
    //   this.ponOperando(this.init());
    // }
  }
  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnChanges(_changes: SimpleChanges): void {
    // if (this.init()) {
    //   this.ponOperando(this.init().toString());
    // }
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(ev: KeyboardEvent) {
    if ('0' <= ev.key && ev.key <= '9')
      this.ponDigito(ev.key)
    else if ('+-*/='.indexOf(ev.key) >= 0)
      this.calcula(ev.key)
    else
      switch (ev.key.toLowerCase()) {
        case '.': if (this.SeparadorDecimal === '.') this.ponComa(); break;
        case ',': if (this.SeparadorDecimal === ',') this.ponComa(); break;
        case 'backspace': this.borrar(); break;
        case 'c': this.inicia(); break;
      }
    if (!environment.production) console.log(`Tecla: ${ev.key}`)
  }

  // import { fromEvent } from 'rxjs';
  // teclado = fromEvent(document, 'keydown').subscribe({next: ev => this.handleKeyDown(ev as KeyboardEvent)})
  // ngOnDestroy() {
  //   this.teclado.unsubscribe()
  // }
}

