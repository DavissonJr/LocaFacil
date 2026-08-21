import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterEmpresaRequest } from '../../../core/models/auth.model';
import { maskCnpj, maskTelefone } from '../../../core/utils/mask.util';

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
              <div class="form-field"><label>CNPJ</label><input name="cnpj" [ngModel]="form.cnpj" (ngModelChange)="onCnpjChange($event)" required placeholder="00.000.000/0000-00" maxlength="18" /></div>
              <div class="form-field"><label>Telefone</label><input name="telefone" [ngModel]="form.telefone" (ngModelChange)="onTelefoneChange($event)" placeholder="(00) 00000-0000" maxlength="15" /></div>
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
        <div class="grid-overlay"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>

        <div class="hero-content">
          <div class="hero-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </div>
          <h1>Comece em <span>minutos</span></h1>
          <p>Sem cartão de crédito, sem burocracia. Crie sua conta e já cadastre seu primeiro veículo.</p>
          <ul class="hero-list">
            <li><span class="dot"></span> Cadastro rápido e gratuito</li>
            <li><span class="dot"></span> Seus dados totalmente isolados</li>
            <li><span class="dot"></span> Upload de fotos de veículos e documentos</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; background: var(--color-bg); }

    .hero {
      flex: 1;
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
    .orb-1 { width: 340px; height: 340px; top: -100px; left: -80px; background: radial-gradient(circle, rgba(239,35,60,0.5), transparent 70%); animation: floatOrb 7s ease-in-out infinite; }
    .orb-2 { width: 260px; height: 260px; bottom: -80px; right: -60px; background: radial-gradient(circle, rgba(255,77,94,0.35), transparent 70%); animation: floatOrb 9s ease-in-out infinite reverse; }
    @keyframes floatOrb { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20px, -20px) scale(1.1); } }

    .hero-content { position: relative; z-index: 1; max-width: 380px; color: white; }
    .hero-icon {
      width: 54px; height: 54px; border-radius: 15px;
      background: rgba(239,35,60,0.15); border: 1px solid rgba(255,77,94,0.3);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; margin-bottom: 26px;
      box-shadow: 0 0 30px rgba(239,35,60,0.25);
    }
    .hero-icon svg { width: 27px; height: 27px; color: #ff8a94; }
    .hero h1 { font-size: 30px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 16px; }
    .hero h1 span { color: #ff4d5e; text-shadow: 0 0 24px rgba(255,77,94,0.6); }
    .hero p { font-size: 15px; line-height: 1.65; opacity: 0.75; margin-bottom: 30px; }
    .hero-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 15px; }
    .hero-list li { display: flex; align-items: center; gap: 11px; font-size: 14px; font-weight: 500; opacity: 0.9; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #ff4d5e; box-shadow: 0 0 8px #ff4d5e; flex-shrink: 0; }

    .form-side { flex: 1.15; display: flex; align-items: center; justify-content: center; padding: 40px 24px; overflow-y: auto; }
    .auth-card { width: 100%; max-width: 500px; }
    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 600; color: var(--color-text-muted);
      text-decoration: none; margin-bottom: 22px; transition: color 0.15s;
    }
    .back-link:hover { color: var(--color-text); }
    h2 { font-size: 25px; font-weight: 800; letter-spacing: -0.02em; }
    .subtitle { color: var(--color-text-muted); font-size: 14px; margin: 6px 0 26px; }
    .section-label {
      font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--color-primary-bright); margin: 24px 0 14px;
    }
    .section-label:first-of-type { margin-top: 4px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .full { width: 100%; justify-content: center; margin-top: 10px; padding: 13px; font-size: 15px; }

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

  onCnpjChange(valor: string): void {
    this.form.cnpj = maskCnpj(valor);
  }

  onTelefoneChange(valor: string): void {
    this.form.telefone = maskTelefone(valor);
  }

  registrar(): void {
    this.erro = '';
    this.carregando = true;
    this.auth.registrarEmpresa(this.form).subscribe({
      next: () => this.router.navigate(['/veiculos']),
      error: (err) => {
        this.erro = err.error?.erro ?? 'Não foi possível criar a conta. Verifique os dados.';
        this.carregando = false;
      }
    });
  }
}
