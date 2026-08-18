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
        <div class="brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="16.5" cy="15.5" r="1.2" fill="currentColor"/></svg>
          </div>
          <span>LocaFácil</span>
        </div>

        <nav>
          <a routerLink="/veiculos" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="16.5" cy="15.5" r="1.2" fill="currentColor"/></svg>
            Veículos
          </a>
          <a routerLink="/clientes" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.8"/><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            Clientes
          </a>
          <a routerLink="/contratos" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none"><path d="M7 4h10a1 1 0 0 1 1 1v15l-3-2-3 2-3-2-3 2V5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 9h6M9 12.5h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            Contratos
          </a>
        </nav>

        <div class="user-box">
          <div class="user-row">
            <div class="avatar">{{ iniciais() }}</div>
            <div class="user-info">
              <div class="user-name">{{ auth.usuario()?.nome }}</div>
              <div class="user-empresa">{{ auth.usuario()?.empresaNome }}</div>
            </div>
          </div>
          <button class="btn btn-secondary logout" (click)="sair()">
            <svg viewBox="0 0 24 24" fill="none"><path d="M15 17l5-5-5-5M20 12H9M12 19H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Sair
          </button>
        </div>
      </aside>

      <main class="content page-enter">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell { display: flex; min-height: 100vh; }
    .sidebar {
      width: 252px;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      padding: 24px 18px;
      position: sticky;
      top: 0;
      height: 100vh;
    }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; padding: 0 6px; }
    .brand-icon {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, var(--color-primary), #6d28d9);
      color: white; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 3px 10px rgba(79, 70, 229, 0.35);
    }
    .brand-icon svg { width: 19px; height: 19px; }
    .brand span { font-size: 17px; font-weight: 800; letter-spacing: -0.02em; }

    nav { display: flex; flex-direction: column; gap: 3px; flex: 1; }
    nav a {
      display: flex; align-items: center; gap: 11px;
      padding: 11px 13px;
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.15s var(--ease);
    }
    nav a svg { width: 18px; height: 18px; flex-shrink: 0; }
    nav a:hover { background: var(--color-muted-bg); color: var(--color-text); }
    nav a.active {
      background: linear-gradient(135deg, var(--color-primary), #6d28d9);
      color: white;
      box-shadow: 0 3px 10px rgba(79, 70, 229, 0.28);
    }

    .user-box { border-top: 1px solid var(--color-border); padding-top: 16px; }
    .user-row { display: flex; align-items: center; gap: 10px; padding: 0 4px; margin-bottom: 14px; }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
      background: var(--color-primary-light); color: var(--color-primary);
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 800;
    }
    .user-info { min-width: 0; }
    .user-name { font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-empresa { font-size: 12px; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .logout { width: 100%; justify-content: center; }

    .content { flex: 1; padding: 36px 40px; max-width: 1180px; }
  `]
})
export class ShellComponent {
  constructor(public auth: AuthService, private router: Router) {}

  iniciais(): string {
    const nome = this.auth.usuario()?.nome ?? '';
    return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
