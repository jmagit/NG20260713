import { Routes } from '@angular/router';
import { LibrosList, LibrosAdd, LibrosEdit, LibrosView } from './componentes';
import { AuthCanActivate } from '../security';

export const routes: Routes = [
  { path: '', component: LibrosList },
  { path: 'add', component: LibrosAdd },
  { path: ':id/edit', component: LibrosEdit, canActivate: [AuthCanActivate] },
  { path: ':id', component: LibrosView },
  { path: ':id/:kk', component: LibrosView },
]
