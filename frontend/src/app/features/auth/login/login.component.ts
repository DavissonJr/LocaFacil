import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="hero">
        <div class="hero-content">
          <div class="hero-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="15.5" r="1.1" fill="currentColor"/><circle cx="16.5" cy="15.5" r="1.1" fill="currentColor"/></svg>
          </div>
          <h1>LocaFácil</h1>
          <p>A forma mais simples de gerenciar frota, clientes e contratos da sua locadora — tudo em um só lugar.</p>
          <ul class="hero-list">
            <li><span class="dot"></span> Controle total da frota em tempo real</li>
            <li><span class="dot"></span> Contratos com cálculo automático de valores</li>
            <li><span class="dot"></span> Seus dados isolados com segurança</li>
          </ul>
        </div>
      </div>

      <div class="form-side">
        <div class="auth-card">
          <h2>Bem-vindo de volta</h2>
          <p class="subtitle">Entre com sua conta para continuar</p>

          <form (ngSubmit)="entrar()">
            <div class="form-field">
              <label>E-mail</label>
              <input type="email" name="email" [(ngModel)]="email" required autocomplete="email" placeholder="voce@empresa.com" />
            </div>
            <div class="form-field">
              <label>Senha</label>
              <input type="password" name="senha" [(ngModel)]="senha" required autocomplete="current-password" placeholder="••••••••" />
            </div>

            <p class="error-msg" *ngIf="erro">
              <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              {{ erro }}
            </p>

            <button class="btn btn-primary full" type="submit" [disabled]="carregando">
              {{ carregando ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>

          <p class="footer-link">
            Sua empresa ainda não tem conta? <a routerLink="/registrar-empresa">Cadastre-se</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; }

    .hero {
      flex: 1.1;
      background: linear-gradient(160deg, #4f46e5 0%, #6d28d9 55%, #4338ca 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 48px; position: relative; overflow: hidden;
    }
    .hero::before, .hero::after {
      content: ''; position: absolute; border-radius: 50%;
      background: rgba(255,255,255,0.08);
    }
    .hero::before { width: 420px; height: 420px; top: -140px; right: -140px; }
    .hero::after { width: 300px; height: 300px; bottom: -100px; left: -80px; }
    .hero-content { position: relative; z-index: 1; max-width: 420px; color: white; }
    .hero-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: rgba(255,255,255,0.15); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
    }
    .hero-icon svg { width: 26px; height: 26px; }
    .hero h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 14px; }
    .hero p { font-size: 15px; line-height: 1.6; opacity: 0.88; margin-bottom: 28px; }
    .hero-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 14px; }
    .hero-list li { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; opacity: 0.95; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: white; flex-shrink: 0; }

    .form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--color-bg); }
    .auth-card { width: 100%; max-width: 380px; }
    h2 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .subtitle { color: var(--color-text-muted); font-size: 14px; margin: 6px 0 28px; }
    .full { width: 100%; justify-content: center; margin-top: 6px; padding: 12px; }
    .footer-link { text-align: center; font-size: 13.5px; color: var(--color-text-muted); margin-top: 26px; }
    .footer-link a { color: var(--color-primary); font-weight: 700; text-decoration: none; }
    .footer-link a:hover { text-decoration: underline; }

    @media (max-width: 860px) { .hero { display: none; } }
  `]
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = '';
  carregando = false;

  constructor(private auth: AuthService, private router: Router) {}

  entrar(): void {
    this.erro = '';
    this.carregando = true;
    this.auth.login({ email: this.email, senha: this.senha }).subscribe({
      next: () => this.router.navigate(['/veiculos']),
      error: (err) => {
        this.erro = err.status === 401 ? 'E-mail ou senha inválidos.' : 'Não foi possível entrar. Tente novamente.';
        this.carregando = false;
      }
    });
  }
}
