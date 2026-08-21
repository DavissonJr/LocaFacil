import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PerfilService } from './perfil.service';
import { AuthService } from '../../core/services/auth.service';
import { Perfil } from '../../core/models/perfil.model';
import { backdropFade, modalSpring } from '../../core/animations/fluid.animations';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div>
        <h2>Seu perfil</h2>
        <p class="subtitle">Gerencie seus dados de acesso</p>
      </div>
    </div>

    <div class="layout" *ngIf="perfil as p">
      <div class="card section">
        <div class="section-head">
          <div class="avatar-lg">{{ iniciais(p.nome) }}</div>
          <div>
            <strong class="nome-grande">{{ p.nome }}</strong>
            <span class="badge" [ngClass]="p.role === 'Admin' ? 'badge-danger' : 'badge-muted'">{{ p.role }}</span>
          </div>
        </div>

        <p class="section-hint">{{ p.empresaNome }} · CNPJ {{ p.empresaCNPJ }}</p>

        <form (ngSubmit)="salvarPerfil()" class="form-block">
          <div class="form-field"><label>Nome</label><input [(ngModel)]="formPerfil.nome" name="nome" required /></div>
          <div class="form-field"><label>E-mail</label><input type="email" [(ngModel)]="formPerfil.email" name="email" required /></div>
          <p class="error-msg" *ngIf="erroPerfil">{{ erroPerfil }}</p>
          <p class="sucesso-msg" *ngIf="sucessoPerfil">Dados atualizados com sucesso.</p>
          <button class="btn btn-primary" type="submit" [disabled]="salvandoPerfil">
            {{ salvandoPerfil ? 'Salvando...' : 'Salvar alterações' }}
          </button>
        </form>
      </div>

      <div class="card section">
        <h3 class="section-title">Alterar senha</h3>
        <form (ngSubmit)="salvarSenha()" class="form-block">
          <div class="form-field"><label>Senha atual</label><input type="password" [(ngModel)]="formSenha.senhaAtual" name="senhaAtual" required /></div>
          <div class="form-field"><label>Nova senha</label><input type="password" [(ngModel)]="formSenha.novaSenha" name="novaSenha" required minlength="6" /></div>
          <p class="error-msg" *ngIf="erroSenha">{{ erroSenha }}</p>
          <p class="sucesso-msg" *ngIf="sucessoSenha">Senha alterada com sucesso.</p>
          <button class="btn btn-secondary" type="submit" [disabled]="salvandoSenha">
            {{ salvandoSenha ? 'Alterando...' : 'Alterar senha' }}
          </button>
        </form>
      </div>

      <div class="card section danger-zone" *ngIf="p.role === 'Admin'">
        <div class="danger-head">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a1.5 1.5 0 0 0 1.3 2.25h17.76a1.5 1.5 0 0 0 1.3-2.25L13.7 3.86a1.5 1.5 0 0 0-2.6 0Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <div>
            <h3 class="section-title">Zona de perigo</h3>
            <p class="section-hint">Excluir a conta apaga permanentemente a empresa, todos os veículos, clientes, contratos e usuários. Essa ação não pode ser desfeita.</p>
          </div>
        </div>
        <button class="btn btn-danger" (click)="abrirExclusao()">Excluir conta da empresa</button>
      </div>
    </div>

    <!-- Modal de confirmação de exclusão -->
    <div class="modal-backdrop" *ngIf="modalExclusaoAberto" (click)="fecharExclusao()" @backdropFade>
      <div class="modal card" (click)="$event.stopPropagation()" @modalSpring>
        <h3 class="danger-title">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a1.5 1.5 0 0 0 1.3 2.25h17.76a1.5 1.5 0 0 0 1.3-2.25L13.7 3.86a1.5 1.5 0 0 0-2.6 0Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Excluir conta permanentemente
        </h3>
        <p class="section-hint">
          Isso vai apagar <strong>{{ perfil?.empresaNome }}</strong> e todos os dados vinculados a ela para sempre.
          Pra confirmar, digite o nome da empresa e sua senha.
        </p>

        <div class="form-field">
          <label>Digite "{{ perfil?.empresaNome }}" para confirmar</label>
          <input [(ngModel)]="confirmacaoNome" name="confirmacaoNome" [placeholder]="perfil?.empresaNome" />
        </div>
        <div class="form-field">
          <label>Sua senha</label>
          <input type="password" [(ngModel)]="confirmacaoSenha" name="confirmacaoSenha" />
        </div>

        <p class="error-msg" *ngIf="erroExclusao">{{ erroExclusao }}</p>

        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="fecharExclusao()">Cancelar</button>
          <button class="btn btn-danger" (click)="confirmarExclusao()"
                  [disabled]="excluindo || confirmacaoNome !== perfil?.empresaNome || !confirmacaoSenha">
            {{ excluindo ? 'Excluindo...' : 'Excluir para sempre' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header { margin-bottom: 24px; }
    h2 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .subtitle { color: var(--color-text-muted); font-size: 14px; margin-top: 4px; }

    .layout { display: flex; flex-direction: column; gap: 20px; max-width: 560px; }
    .section { padding: 26px; }
    .section-head { display: flex; align-items: center; gap: 14px; margin-bottom: 6px; }
    .avatar-lg {
      width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--color-primary-bright), var(--color-primary-dark));
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 17px; font-weight: 800; box-shadow: 0 3px 14px var(--color-primary-glow);
    }
    .nome-grande { display: block; font-size: 17px; font-weight: 800; margin-bottom: 4px; }
    .section-hint { font-size: 13px; color: var(--color-text-muted); margin-bottom: 20px; line-height: 1.5; }
    .section-title { font-size: 15px; font-weight: 800; margin-bottom: 6px; }
    .form-block { display: flex; flex-direction: column; }

    .sucesso-msg {
      color: var(--color-success); background: var(--color-success-bg);
      padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; margin-top: 4px; margin-bottom: 14px;
    }

    .danger-zone { border-color: rgba(255,77,94,0.3); }
    .danger-head { display: flex; gap: 14px; margin-bottom: 18px; }
    .danger-head svg { width: 22px; height: 22px; color: var(--color-danger); flex-shrink: 0; margin-top: 2px; }
    .danger-title { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 800; color: var(--color-danger); margin-bottom: 10px; }
    .danger-title svg { width: 20px; height: 20px; }

    .modal { max-width: 480px; padding: 30px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
  `],
  animations: [backdropFade, modalSpring]
})
export class PerfilComponent implements OnInit {
  perfil: Perfil | null = null;
  formPerfil = { nome: '', email: '' };
  erroPerfil = '';
  sucessoPerfil = false;
  salvandoPerfil = false;

  formSenha = { senhaAtual: '', novaSenha: '' };
  erroSenha = '';
  sucessoSenha = false;
  salvandoSenha = false;

  modalExclusaoAberto = false;
  confirmacaoNome = '';
  confirmacaoSenha = '';
  erroExclusao = '';
  excluindo = false;

  constructor(private service: PerfilService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.service.obterPerfil().subscribe(p => {
      this.perfil = p;
      this.formPerfil = { nome: p.nome, email: p.email };
    });
  }

  iniciais(nome: string): string {
    return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  salvarPerfil(): void {
    this.erroPerfil = '';
    this.sucessoPerfil = false;
    this.salvandoPerfil = true;
    this.service.atualizarPerfil(this.formPerfil).subscribe({
      next: (p) => {
        this.perfil = p;
        this.salvandoPerfil = false;
        this.sucessoPerfil = true;
        setTimeout(() => this.sucessoPerfil = false, 3000);
      },
      error: (err) => {
        this.salvandoPerfil = false;
        this.erroPerfil = err.error?.erro ?? 'Não foi possível salvar.';
      }
    });
  }

  salvarSenha(): void {
    this.erroSenha = '';
    this.sucessoSenha = false;
    this.salvandoSenha = true;
    this.service.alterarSenha(this.formSenha).subscribe({
      next: () => {
        this.salvandoSenha = false;
        this.sucessoSenha = true;
        this.formSenha = { senhaAtual: '', novaSenha: '' };
        setTimeout(() => this.sucessoSenha = false, 3000);
      },
      error: (err) => {
        this.salvandoSenha = false;
        this.erroSenha = err.error?.erro ?? 'Não foi possível alterar a senha.';
      }
    });
  }

  abrirExclusao(): void {
    this.confirmacaoNome = '';
    this.confirmacaoSenha = '';
    this.erroExclusao = '';
    this.modalExclusaoAberto = true;
  }

  fecharExclusao(): void {
    this.modalExclusaoAberto = false;
  }

  confirmarExclusao(): void {
    this.erroExclusao = '';
    this.excluindo = true;
    this.service.excluirEmpresa({ senha: this.confirmacaoSenha, confirmacaoNomeEmpresa: this.confirmacaoNome }).subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.excluindo = false;
        this.erroExclusao = err.error?.erro ?? 'Não foi possível excluir a conta.';
      }
    });
  }
}
