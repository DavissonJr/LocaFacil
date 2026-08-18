import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">🚗 LocaFácil</div>

        <nav>
          <a routerLink="/veiculos" routerLinkActive="active">Veículos</a>
          <a routerLink="/clientes" routerLinkActive="active">Clientes</a>
          <a routerLink="/contratos" routerLinkActive="active">Contratos</a>
        </nav>

        <div class="user-box">
          <div class="user-name">{{ auth.usuario()?.nome }}</div>
          <div class="user-empresa">{{ auth.usuario()?.empresaNome }}</div>
          <button class="btn btn-secondary logout" (click)="sair()">Sair</button>
        </div>
      </aside>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; }
    .sidebar {
      width: 240px;
      background: white;
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
      position: sticky;
      top: 0;
      height: 100vh;
    }
    .brand { font-size: 18px; font-weight: 700; color: var(--color-primary); margin-bottom: 32px; padding: 0 8px; }
    nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    nav a {
      padding: 10px 12px;
      border-radius: 8px;
      color: var(--color-text-muted);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }
    nav a:hover { background: var(--color-bg); color: var(--color-text); }
    nav a.active { background: var(--color-primary-light); color: var(--color-primary); font-weight: 600; }
    .user-box { border-top: 1px solid var(--color-border); padding-top: 16px; }
    .user-name { font-size: 14px; font-weight: 600; }
    .user-empresa { font-size: 12px; color: var(--color-text-muted); margin-bottom: 12px; }
    .logout { width: 100%; justify-content: center; }
    .content { flex: 1; padding: 32px; max-width: 1100px; }
  `]
})
export class ShellComponent {
  constructor(public auth: AuthService, private router: Router) {}

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
