import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterEmpresaRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <h1>Cadastre sua locadora</h1>
        <p class="subtitle">Crie a conta da sua empresa e o usuário administrador</p>

        <form (ngSubmit)="registrar()">
          <div class="grid">
            <div class="form-field">
              <label>Razão social</label>
              <input name="razaoSocial" [(ngModel)]="form.razaoSocial" required />
            </div>
            <div class="form-field">
              <label>Nome fantasia</label>
              <input name="nomeFantasia" [(ngModel)]="form.nomeFantasia" />
            </div>
          </div>

          <div class="grid">
            <div class="form-field">
              <label>CNPJ</label>
              <input name="cnpj" [(ngModel)]="form.cnpj" required placeholder="00.000.000/0000-00" />
            </div>
            <div class="form-field">
              <label>Telefone</label>
              <input name="telefone" [(ngModel)]="form.telefone" />
            </div>
          </div>

          <div class="form-field">
            <label>E-mail da empresa</label>
            <input type="email" name="empresaEmail" [(ngModel)]="form.empresaEmail" required />
          </div>

          <hr />

          <div class="form-field">
            <label>Seu nome (administrador)</label>
            <input name="adminNome" [(ngModel)]="form.adminNome" required />
          </div>
          <div class="grid">
            <div class="form-field">
              <label>Seu e-mail de login</label>
              <input type="email" name="adminEmail" [(ngModel)]="form.adminEmail" required />
            </div>
            <div class="form-field">
              <label>Senha</label>
              <input type="password" name="adminSenha" [(ngModel)]="form.adminSenha" required minlength="6" />
            </div>
          </div>

          <p class="error-msg" *ngIf="erro">{{ erro }}</p>

          <button class="btn btn-primary full" type="submit" [disabled]="carregando">
            {{ carregando ? 'Criando conta...' : 'Criar conta' }}
          </button>
        </form>

        <p class="footer-link">Já tem conta? <a routerLink="/login">Entrar</a></p>
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
    .auth-card { width: 100%; max-width: 480px; padding: 40px; }
    h1 { font-size: 22px; font-weight: 700; color: var(--color-primary); }
    .subtitle { color: var(--color-text-muted); font-size: 14px; margin: 8px 0 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    hr { border: none; border-top: 1px solid var(--color-border); margin: 8px 0 20px; }
    .full { width: 100%; justify-content: center; margin-top: 8px; }
    .footer-link { text-align: center; font-size: 13px; color: var(--color-text-muted); margin-top: 20px; }
    .footer-link a { color: var(--color-primary); font-weight: 600; text-decoration: none; }
  `]
})
export class RegisterComponent {
  form: RegisterEmpresaRequest = {
    razaoSocial: '', nomeFantasia: '', cnpj: '', empresaEmail: '', telefone: '',
    adminNome: '', adminEmail: '', adminSenha: ''
  };
  erro = '';
  carregando = false;

  constructor(private auth: AuthService, private router: Router) {}

  registrar(): void {
    this.erro = '';
    this.carregando = true;
    this.auth.registrarEmpresa(this.form).subscribe({
      next: () => this.router.navigate(['/veiculos']),
      error: (err) => {
        this.erro = err.status === 409
          ? 'Já existe uma empresa cadastrada com esse CNPJ.'
          : 'Não foi possível criar a conta. Verifique os dados.';
        this.carregando = false;
      }
    });
  }
}
