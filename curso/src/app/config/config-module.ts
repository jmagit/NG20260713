import { Routes } from '@angular/router';
import { Configuracion } from './configuracion/configuracion';
import { Perfil } from './perfil/perfil';
import { Permisos } from './permisos/permisos';

export const routes: Routes = [
  { path: '', component: Configuracion },
  { path: 'perfil', component: Perfil },
  { path: 'permisos', component: Permisos },
]
