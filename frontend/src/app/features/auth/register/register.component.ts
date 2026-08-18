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
      <div class="form-side">
        <div class="auth-card">
          <a routerLink="/login" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Voltar para login
          </a>

          <h2>Crie sua conta</h2>
          <p class="subtitle">Cadastre sua locadora e comece a usar agora mesmo</p>

          <form (ngSubmit)="registrar()">
            <p class="section-label">Dados da empresa</p>
            <div class="grid">
              <div class="form-field"><label>Razão social</label><input name="razaoSocial" [(ngModel)]="form.razaoSocial" required /></div>
              <div class="form-field"><label>Nome fantasia</label><input name="nomeFantasia" [(ngModel)]="form.nomeFantasia" /></div>
            </div>
            <div class="grid">
              <div class="form-field"><label>CNPJ</label><input name="cnpj" [(ngModel)]="form.cnpj" required placeholder="00.000.000/0000-00" /></div>
              <div class="form-field"><label>Telefone</label><input name="telefone" [(ngModel)]="form.telefone" /></div>
            </div>
            <div class="form-field"><label>E-mail da empresa</label><input type="email" name="empresaEmail" [(ngModel)]="form.empresaEmail" required /></div>

            <p class="section-label">Sua conta de administrador</p>
            <div class="form-field"><label>Seu nome</label><input name="adminNome" [(ngModel)]="form.adminNome" required /></div>
            <div class="grid">
              <div class="form-field"><label>E-mail de login</label><input type="email" name="adminEmail" [(ngModel)]="form.adminEmail" required /></div>
              <div class="form-field"><label>Senha</label><input type="password" name="adminSenha" [(ngModel)]="form.adminSenha" required minlength="6" /></div>
            </div>

            <p class="error-msg" *ngIf="erro">
              <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              {{ erro }}
            </p>

            <button class="btn btn-primary full" type="submit" [disabled]="carregando">
              {{ carregando ? 'Criando conta...' : 'Criar conta' }}
            </button>
          </form>
        </div>
      </div>

      <div class="hero">
        <div class="hero-content">
          <div class="hero-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </div>
          <h1>Comece em minutos</h1>
          <p>Sem cartão de crédito, sem burocracia. Crie sua conta e já cadastre seu primeiro veículo.</p>
          <ul class="hero-list">
            <li><span class="dot"></span> Cadastro rápido e gratuito</li>
            <li><span class="dot"></span> Seus dados totalmente isolados</li>
            <li><span class="dot"></span> Suporte a upload de fotos dos veículos</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; }

    .hero {
      flex: 1;
      background: linear-gradient(160deg, #4f46e5 0%, #6d28d9 55%, #4338ca 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 48px; position: relative; overflow: hidden;
    }
    .hero::before, .hero::after { content: ''; position: absolute; border-radius: 50%; background: rgba(255,255,255,0.08); }
    .hero::before { width: 420px; height: 420px; top: -140px; right: -140px; }
    .hero::after { width: 300px; height: 300px; bottom: -100px; left: -80px; }
    .hero-content { position: relative; z-index: 1; max-width: 380px; color: white; }
    .hero-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: rgba(255,255,255,0.15); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
    }
    .hero-icon svg { width: 26px; height: 26px; }
    .hero h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 14px; }
    .hero p { font-size: 15px; line-height: 1.6; opacity: 0.88; margin-bottom: 28px; }
    .hero-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 14px; }
    .hero-list li { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; opacity: 0.95; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: white; flex-shrink: 0; }

    .form-side { flex: 1.15; display: flex; align-items: center; justify-content: center; padding: 40px 24px; background: var(--color-bg); overflow-y: auto; }
    .auth-card { width: 100%; max-width: 460px; }
    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 600; color: var(--color-text-muted);
      text-decoration: none; margin-bottom: 20px;
    }
    .back-link:hover { color: var(--color-text); }
    h2 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .subtitle { color: var(--color-text-muted); font-size: 14px; margin: 6px 0 24px; }
    .section-label {
      font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--color-primary); margin: 22px 0 14px;
    }
    .section-label:first-of-type { margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full { width: 100%; justify-content: center; margin-top: 10px; padding: 12px; }

    @media (max-width: 860px) { .hero { display: none; } }
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
          : (err.error?.detalhe ?? 'Não foi possível criar a conta. Verifique os dados.');
        this.carregando = false;
      }
    });
  }
}
