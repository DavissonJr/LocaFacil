import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell">
      <!-- Topbar mobile -->
      <header class="mobile-topbar md:hidden">
        <button class="menu-btn" (click)="menuAberto = true" aria-label="Abrir menu">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <div class="brand-mini">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="16.5" cy="15.5" r="1.2" fill="currentColor"/></svg>
          </div>
          <span>LocaFácil</span>
        </div>
        <a routerLink="/perfil" class="avatar-mini">{{ iniciais() }}</a>
      </header>

      <!-- Overlay mobile -->
      <div class="drawer-overlay md:hidden" *ngIf="menuAberto" (click)="menuAberto = false"></div>

      <aside class="sidebar" [class.drawer-open]="menuAberto">
        <div class="brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="16.5" cy="15.5" r="1.2" fill="currentColor"/></svg>
          </div>
          <span>LocaFácil</span>
          <button class="close-btn md:hidden" (click)="menuAberto = false" aria-label="Fechar menu">
            <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>

        <nav>
          <a routerLink="/veiculos" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="16.5" cy="15.5" r="1.2" fill="currentColor"/></svg>
            <span>Veículos</span>
          </a>
          <a routerLink="/clientes" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.8"/><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span>Clientes</span>
          </a>
          <a routerLink="/contratos" routerLinkActive="active">
            <svg viewBox="0 0 24 24" fill="none"><path d="M7 4h10a1 1 0 0 1 1 1v15l-3-2-3 2-3-2-3 2V5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 9h6M9 12.5h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            <span>Contratos</span>
          </a>
        </nav>

        <div class="user-box">
          <a routerLink="/perfil" class="user-row" routerLinkActive="user-row-active">
            <div class="avatar">{{ iniciais() }}</div>
            <div class="user-info">
              <div class="user-name">{{ auth.usuario()?.nome }}</div>
              <div class="user-empresa">{{ auth.usuario()?.empresaNome }}</div>
            </div>
          </a>
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

    .mobile-topbar {
      position: fixed; top: 0; left: 0; right: 0; height: 58px; z-index: 30;
      background: var(--color-bg-elevated); border-bottom: 1px solid var(--color-border);
      display: flex; align-items: center; justify-content: space-between; padding: 0 16px;
    }
    .menu-btn { background: none; border: none; color: var(--color-text); padding: 6px; cursor: pointer; }
    .menu-btn svg { width: 22px; height: 22px; }
    .brand-mini { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 800; }
    .brand-mini .brand-icon { width: 26px; height: 26px; }
    .brand-mini .brand-icon svg { width: 14px; height: 14px; }
    .avatar-mini {
      width: 30px; height: 30px; border-radius: 50%; text-decoration: none;
      background: linear-gradient(135deg, var(--color-primary-bright), var(--color-primary-dark));
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 800;
    }

    .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 45; backdrop-filter: blur(2px); }

    .sidebar {
      width: 256px;
      background: var(--color-bg-elevated);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      padding: 26px 18px;
      position: sticky;
      top: 0;
      height: 100vh;
    }
    .brand { display: flex; align-items: center; gap: 11px; margin-bottom: 38px; padding: 0 6px; }
    .brand-icon {
      width: 36px; height: 36px; border-radius: 11px;
      background: linear-gradient(135deg, var(--color-primary-bright), var(--color-primary-dark));
      color: white; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 14px var(--color-primary-glow); flex-shrink: 0;
    }
    .brand-icon svg { width: 20px; height: 20px; }
    .brand span { font-size: 17px; font-weight: 800; letter-spacing: -0.02em; flex: 1; }
    .close-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; padding: 4px; }
    .close-btn svg { width: 18px; height: 18px; }

    nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    nav a {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.18s var(--ease);
      position: relative;
    }
    nav a svg { width: 18px; height: 18px; flex-shrink: 0; transition: transform 0.18s var(--ease); }
    nav a:hover { background: var(--color-surface); color: var(--color-text); }
    nav a:hover svg { transform: scale(1.1); }
    nav a.active {
      background: linear-gradient(135deg, rgba(239,35,60,0.16), rgba(179,18,42,0.1));
      color: var(--color-primary-bright);
      box-shadow: inset 0 0 0 1px rgba(239, 35, 60, 0.3);
    }
    nav a.active::before {
      content: ''; position: absolute; left: -18px; top: 50%; transform: translateY(-50%);
      width: 3px; height: 20px; border-radius: 3px;
      background: var(--color-primary-bright); box-shadow: 0 0 10px var(--color-primary-bright);
    }

    .user-box { border-top: 1px solid var(--color-border); padding-top: 16px; }
    .user-row {
      display: flex; align-items: center; gap: 10px; padding: 8px 4px; margin-bottom: 10px;
      text-decoration: none; border-radius: var(--radius-sm); transition: background 0.15s;
    }
    .user-row:hover, .user-row-active { background: var(--color-surface); }
    .avatar {
      width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--color-primary-bright), var(--color-primary-dark));
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 800;
      box-shadow: 0 2px 10px var(--color-primary-glow);
    }
    .user-info { min-width: 0; }
    .user-name { font-size: 13.5px; font-weight: 700; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-empresa { font-size: 12px; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .logout { width: 100%; justify-content: center; }

    .content { flex: 1; padding: 38px 42px; max-width: 1220px; }

    /* Garantia extra (independente do Tailwind): o topbar mobile nunca aparece
       em telas médias/grandes, então não tem como sobrepor a sidebar fixa. */
    @media (min-width: 768px) {
      .mobile-topbar { display: none !important; }
    }

    @media (max-width: 767px) {
      .shell { flex-direction: column; }
      .mobile-topbar { z-index: 41; }
      .sidebar {
        position: fixed; top: 0; left: 0; height: 100vh; z-index: 50;
        transform: translateX(-100%);
        transition: transform 0.28s var(--ease-spring);
        box-shadow: var(--shadow-lg);
      }
      .sidebar.drawer-open { transform: translateX(0); }
      .content { padding: 78px 18px 32px; max-width: 100%; }
    }
  `]
})
export class ShellComponent {
  menuAberto = false;

  constructor(public auth: AuthService, private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.menuAberto = false);
  }

  iniciais(): string {
    const nome = this.auth.usuario()?.nome ?? '';
    return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
