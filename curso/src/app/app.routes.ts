import { Routes } from '@angular/router';
import { Home, PageNotFound } from './layout';
import { Calculadora, Demos, Formulario } from './ejemplos';
import { LoginForm } from './security/login/login';
import { RegisterUser } from './security/register-user/register-user';
import { AuthService } from './security/servicios';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Home },
  { path: 'inicio', component: Home },
  { path: 'demos', component: Demos },
  { path: 'chisme/de/hacer/numeros', component: Calculadora, title: 'Calculadora' },
  { path: 'formulario', component: Formulario },

  { path: 'dashboard', loadComponent: () => import('./ejemplos/dashboard/dashboard'), /*canActivate: [ AuthCanActivate]*/ },

  { path: 'login', component: LoginForm },
  { path: 'registro', component: RegisterUser },

  { path: '404.html', component: PageNotFound },
  { path: '**', component: PageNotFound },
];

export function generaMenu(_auth: AuthService): Option[] {
  return [
    { texto: 'Inicio', icono: 'fa-solid fa-house', path: '/inicio', visible: true },
    { texto: 'Demos', icono: 'fa-solid fa-person-chalkboard', path: '/demos', visible: true },
    { texto: 'Formulario', icono: 'fa-solid fa-chalkboard-user', path: '/formulario', visible: true },
    { texto: 'Calculadora', icono: 'fa-solid fa-calculator', path: '/chisme/de/hacer/numeros', visible: true },
    { texto: 'Dashboard', icono: 'fa-solid fa-table-columns', path: '/dashboard', visible: true, /* visible: auth.isInRoles('Empleados'),*/ },
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
