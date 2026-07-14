import { Routes } from '@angular/router';
import { Home, PageNotFound } from './layout';
import { Demos } from './ejemplos';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Home },
  { path: 'inicio', component: Home },
  { path: 'demos', component: Demos },

  { path: '404.html', component: PageNotFound },
  { path: '**', component: PageNotFound },
];

export function generaMenu(): Option[] {
  return [
    { texto: 'Inicio', icono: 'fa-solid fa-house', path: '/inicio', visible: true },
    { texto: 'Demos', icono: 'fa-solid fa-person-chalkboard', path: '/demos', visible: true },
    { texto: 'Falla', icono: 'fa-solid fa-ban', path: '/desconocido', visible: true },
  ]
}

export interface Option {
  texto: string
  icono: string
  path?: string
  children?: Child[]
  visible: boolean
}
export interface Child {
  texto: string
  icono: string
  path: string
  separado?: boolean
  visible: boolean
}
