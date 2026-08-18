import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registrar-empresa',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'veiculos', pathMatch: 'full' },
      {
        path: 'veiculos',
        loadComponent: () => import('./features/veiculos/veiculos-list.component').then(m => m.VeiculosListComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/clientes-list.component').then(m => m.ClientesListComponent)
      },
      {
        path: 'contratos',
        loadComponent: () => import('./features/contratos/contratos-list.component').then(m => m.ContratosListComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
