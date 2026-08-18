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
      <div class="auth-card card">
        <h1>LocaFácil</h1>
        <p class="subtitle">Entre com sua conta para gerenciar sua locadora</p>

        <form (ngSubmit)="entrar()">
          <div class="form-field">
            <label>E-mail</label>
            <input type="email" name="email" [(ngModel)]="email" required autocomplete="email" />
          </div>
          <div class="form-field">
            <label>Senha</label>
            <input type="password" name="senha" [(ngModel)]="senha" required autocomplete="current-password" />
          </div>

          <p class="error-msg" *ngIf="erro">{{ erro }}</p>

          <button class="btn btn-primary full" type="submit" [disabled]="carregando">
            {{ carregando ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <p class="footer-link">
          Sua empresa ainda não tem conta? <a routerLink="/registrar-empresa">Cadastre-se</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%);
      padding: 24px;
    }
    .auth-card {
      width: 100%;
      max-width: 380px;
      padding: 40px;
    }
    h1 { font-size: 24px; font-weight: 700; color: var(--color-primary); }
    .subtitle { color: var(--color-text-muted); font-size: 14px; margin: 8px 0 28px; }
    .full { width: 100%; justify-content: center; margin-top: 8px; }
    .footer-link { text-align: center; font-size: 13px; color: var(--color-text-muted); margin-top: 24px; }
    .footer-link a { color: var(--color-primary); font-weight: 600; text-decoration: none; }
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
