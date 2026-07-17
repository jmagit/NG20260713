import { Routes, UrlSegment } from '@angular/router';
import { Home, PageNotFound } from './layout';
import { Calculadora, Demos, Formulario } from './ejemplos';
import { AuthWithRedirectCanActivate, AuthCanActivate, InRoleCanActivate, LoginForm, RegisterUser, AuthService } from './security';

export function graficoFiles(url: UrlSegment[]) {
  return url.length === 1 && url[0].path.endsWith('.svg') ? ({ consumed: url }) : null;
}

//  /formulario/add
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/inicio' },
  { path: 'inicio', component: Home },
  { path: 'demos', component: Demos },
  { path: 'chisme/de/hacer/numeros', component: Calculadora, title: 'Calculadora' },
  { path: 'formulario', component: Formulario },
  // { path: 'formulario/add', component: Formulario },
  // { path: 'formulario/:id/edit', component: Formulario },
  // { path: 'formulario/:id', component: Formulario },
  // { path: 'formulario/:id/:kk', component: Formulario },
  // { path: 'libros', children: [
  //   { path: '', component: Formulario },
  //   { path: 'add', component: Formulario },
  //   { path: ':id/edit', component: Formulario },
  //   { path: ':id', component: Formulario },
  //   { path: ':id/:kk', component: Formulario },
  // ] },

  { matcher: graficoFiles, loadComponent: () => import('./ejemplos/grafico-svg/grafico-svg'), canActivate: [AuthWithRedirectCanActivate('login')]},
  { path: 'config', loadChildren: () => import('./config/config-module').then(mod => mod.routes), canActivate: [AuthCanActivate]},
  { path: 'dashboard', loadComponent: () => import('./ejemplos/dashboard/dashboard'), canActivate: [ InRoleCanActivate('Empleados')] },

  { path: 'contactos', loadChildren: () => import('./contactos/contactos-module').then(mod => mod.routes) },
  { path: 'alysia/baxendale', redirectTo: '/contactos/43' },
  { path: 'libros', loadChildren: () => import('./libros/libros-module').then(mod => mod.routes) },

  { path: 'login', component: LoginForm },
  { path: 'registro', component: RegisterUser },

  { path: '404.html', component: PageNotFound },
  { path: '**', redirectTo: '404.html' },
];

export function generaMenu(auth: AuthService): Option[] {
  return [
    { texto: 'Inicio', icono: 'fa-solid fa-house', path: '/inicio', visible: true },
    { texto: 'Demos', icono: 'fa-solid fa-person-chalkboard', path: '/demos', visible: true },
    { texto: 'Formulario', icono: 'fa-solid fa-chalkboard-user', path: '/formulario', visible: true },
    { texto: 'Contactos', icono: 'fa-solid fa-address-book', path: '/contactos', visible: true },
    { texto: 'Alysia', icono: 'fa-solid fa-address-book', path: '/alysia/baxendale', visible: true },
    { texto: 'Libros', icono: 'fa-solid fa-book', path: '/libros', visible: auth.isInRoles('Empleados') },
    { texto: 'Calculadora', icono: 'fa-solid fa-calculator', path: '/chisme/de/hacer/numeros', visible: true },
    { texto: 'SVG', icono: 'fa-solid fa-image', path: '/falso.svg', visible: true, },
    { texto: 'Dashboard', icono: 'fa-solid fa-table-columns', path: '/dashboard', visible: auth.isInRoles('Empleados'), },
    {
      texto: 'config', icono: 'fa-solid fa-gears', visible: auth.isAuthenticated(), children: [
        { texto: 'config', icono: 'fa-solid fa-gears', path: '/config', visible: true },
        { texto: 'perfil', icono: 'fa-solid fa-user-pen', path: '/config/perfil', visible: true, separado: true },
        { texto: 'Permisos', icono: 'fa-solid fa-screwdriver-wrench', path: '/config/permisos', visible: true },
      ]
    },
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
