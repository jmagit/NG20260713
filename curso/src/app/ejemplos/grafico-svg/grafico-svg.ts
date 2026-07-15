import { Component, signal, OnInit } from '@angular/core';

@Component({
    selector: 'app-grafico-svg',
    templateUrl: './grafico-svg.svg'
})
export default class GraficoSvg implements OnInit {
  fillColor = signal('rgb(255, 0, 0)');

  changeColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    this.fillColor.set(`rgb(${r}, ${g}, ${b})`);
  }

  ngOnInit() {
    this.changeColor()
  }
}
