import { Component, computed, signal } from '@angular/core';
import { Home } from 'src/app/layout';
// import { LoginForm } from 'src/app/security';
import { Calculadora } from '../calculadora/calculadora';
import { Demos } from '../demos/demos';
import { NgComponentOutlet } from '@angular/common';
import GraficoSvg from '../grafico-svg/grafico-svg';

@Component({
  selector: 'app-dashboard',
  imports: [NgComponentOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export default class Dashboard {
  menu = [
    { texto: 'inicio', icono: 'fa-solid fa-house', componente: Home },
    { texto: 'demos', icono: 'fa-solid fa-person-chalkboard', componente: Demos },
    { texto: 'calculadora', icono: 'fa-solid fa-calculator', componente: Calculadora },
    { texto: 'gráficas', icono: 'fa-solid fa-image', componente: DashboardGraficas },
  ]
  actual = signal(0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cuerpo = computed<any>(() => this.menu[this.actual()]?.componente)
}

@Component({
  selector: 'app-dashboard-graficas',
  imports: [NgComponentOutlet],
  template: `
<div class="container">
  <div class="row"><input type="button" value="rotar" (click)="rotar()" ></div>
  <div class="row" style="height: 45vh">
    <div class="col-6"><ng-container *ngComponentOutlet="graficas()[0]" /></div>
    <div class="col-6"><ng-container *ngComponentOutlet="graficas()[1]" /></div>
  </div>
  <div class="row">
    <div class="col-6"><ng-container *ngComponentOutlet="graficas()[2]" /></div>
    <div class="col-6"><ng-container *ngComponentOutlet="graficas()[3]" /></div>
  </div>
</div>
  `,
})
export class DashboardGraficas {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graficas = signal<any[]>([GraficoSvg, Calculadora, GraficoSvg, GraficoSvg,])

  rotar() {
    this.graficas.update(value => [...value.filter((_item, index) => index > 0), value[0]])
  }
}

