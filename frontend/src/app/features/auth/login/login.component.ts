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
        <div class="grid-overlay"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>

        <div class="hero-content">
          <div class="hero-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="15.5" r="1.1" fill="currentColor"/><circle cx="16.5" cy="15.5" r="1.1" fill="currentColor"/></svg>
          </div>
          <h1>Loca<span>Fácil</span></h1>
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
    .auth-page { min-height: 100vh; display: flex; background: var(--color-bg); }

    .hero {
      flex: 1.1;
      background: linear-gradient(160deg, #1a0508 0%, #3d0a12 45%, #1a0508 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 48px; position: relative; overflow: hidden;
    }
    .grid-overlay {
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(255,77,94,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,77,94,0.08) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
    }
    .orb { position: absolute; border-radius: 50%; filter: blur(50px); }
    .orb-1 { width: 380px; height: 380px; top: -100px; right: -100px; background: radial-gradient(circle, rgba(239,35,60,0.5), transparent 70%); animation: floatOrb 7s ease-in-out infinite; }
    .orb-2 { width: 280px; height: 280px; bottom: -80px; left: -60px; background: radial-gradient(circle, rgba(255,77,94,0.35), transparent 70%); animation: floatOrb 9s ease-in-out infinite reverse; }
    @keyframes floatOrb { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, -20px) scale(1.1); } }

    .hero-content { position: relative; z-index: 1; max-width: 420px; color: white; }
    .hero-icon {
      width: 54px; height: 54px; border-radius: 15px;
      background: rgba(239,35,60,0.15); border: 1px solid rgba(255,77,94,0.3);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; margin-bottom: 26px;
      box-shadow: 0 0 30px rgba(239,35,60,0.25);
    }
    .hero-icon svg { width: 27px; height: 27px; color: #ff8a94; }
    .hero h1 { font-size: 34px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 16px; }
    .hero h1 span { color: #ff4d5e; text-shadow: 0 0 24px rgba(255,77,94,0.6); }
    .hero p { font-size: 15px; line-height: 1.65; opacity: 0.75; margin-bottom: 30px; }
    .hero-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 15px; }
    .hero-list li { display: flex; align-items: center; gap: 11px; font-size: 14px; font-weight: 500; opacity: 0.9; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #ff4d5e; box-shadow: 0 0 8px #ff4d5e; flex-shrink: 0; }

    .form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .auth-card { width: 100%; max-width: 380px; }
    h2 { font-size: 25px; font-weight: 800; letter-spacing: -0.02em; }
    .subtitle { color: var(--color-text-muted); font-size: 14px; margin: 6px 0 30px; }
    .full { width: 100%; justify-content: center; margin-top: 6px; padding: 13px; font-size: 15px; }
    .footer-link { text-align: center; font-size: 13.5px; color: var(--color-text-muted); margin-top: 28px; }
    .footer-link a { color: var(--color-primary-bright); font-weight: 700; text-decoration: none; }
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
        this.erro = err.error?.erro ?? 'Não foi possível entrar. Tente novamente.';
        this.carregando = false;
      }
    });
  }
}
