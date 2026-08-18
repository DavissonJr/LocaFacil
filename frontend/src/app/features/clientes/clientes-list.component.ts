import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ClientesService } from './clientes.service';
import { Cliente, ClienteRequest } from '../../core/models/cliente.model';

const CLIENTE_VAZIO: ClienteRequest = {
  nome: '', documentoTipo: 'CPF', documento: '', email: '', telefone: '', endereco: '', cnh: '', validadeCNH: ''
};

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div>
        <h2>Clientes</h2>
        <p class="subtitle">{{ clientes.length }} cliente(s) cadastrado(s)</p>
      </div>
      <button class="btn btn-primary" (click)="abrirNovo()">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
        Novo cliente
      </button>
    </div>

    <div class="search">
      <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      <input placeholder="Buscar por nome ou documento..." [(ngModel)]="busca" (ngModelChange)="buscar()" />
    </div>

    <div class="card" *ngIf="clientes.length > 0; else vazio">
      <table>
        <thead>
          <tr><th>Nome</th><th>Documento</th><th>Contato</th><th>CNH</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of clientes">
            <td><strong>{{ c.nome }}</strong></td>
            <td>{{ c.documentoTipo }}: {{ c.documento }}</td>
            <td>{{ c.telefone || '—' }}<br /><span class="muted">{{ c.email || '' }}</span></td>
            <td>{{ c.cnh || '—' }}</td>
            <td class="actions">
              <button class="btn btn-secondary" (click)="abrirEditar(c)" title="Editar">
                <svg viewBox="0 0 24 24" fill="none"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
              </button>
              <button class="btn btn-danger" (click)="remover(c)" title="Excluir">
                <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ng-template #vazio>
      <div class="empty-state card">
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
        </div>
        <strong>Nenhum cliente encontrado</strong>
        <p>Cadastre o primeiro clicando em "Novo cliente".</p>
      </div>
    </ng-template>

    <div class="modal-backdrop" *ngIf="modalAberto" (click)="fecharModal()">
      <div class="modal card" (click)="$event.stopPropagation()">
        <h3>{{ editandoId ? 'Editar cliente' : 'Novo cliente' }}</h3>

        <div class="form-field"><label>Nome completo</label><input [(ngModel)]="form.nome" name="nome" required /></div>
        <div class="grid-2">
          <div class="form-field">
            <label>Tipo de documento</label>
            <select [(ngModel)]="form.documentoTipo" name="documentoTipo">
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
            </select>
          </div>
          <div class="form-field"><label>Número</label><input [(ngModel)]="form.documento" name="documento" required /></div>
        </div>
        <div class="grid-2">
          <div class="form-field"><label>E-mail</label><input type="email" [(ngModel)]="form.email" name="email" /></div>
          <div class="form-field"><label>Telefone</label><input [(ngModel)]="form.telefone" name="telefone" /></div>
        </div>
        <div class="form-field"><label>Endereço</label><input [(ngModel)]="form.endereco" name="endereco" /></div>
        <div class="grid-2">
          <div class="form-field"><label>CNH</label><input [(ngModel)]="form.cnh" name="cnh" /></div>
          <div class="form-field"><label>Validade da CNH</label><input type="date" [(ngModel)]="form.validadeCNH" name="validadeCNH" /></div>
        </div>

        <p class="error-msg" *ngIf="erro">{{ erro }}</p>

        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
          <button class="btn btn-primary" (click)="salvar()" [disabled]="salvando">{{ salvando ? 'Salvando...' : 'Salvar' }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    h2 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .subtitle { color: var(--color-text-muted); font-size: 14px; margin-top: 4px; }
    .search { position: relative; margin-bottom: 22px; max-width: 360px; }
    .search svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--color-text-muted); }
    .search input { width: 100%; padding: 11px 14px 11px 38px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 14px; background: white; transition: all 0.15s; }
    .search input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-light); }
    .muted { color: var(--color-text-muted); font-size: 12px; }
    .actions { display: flex; gap: 8px; }
    .actions .btn { padding: 8px; }
    .actions .btn svg { width: 15px; height: 15px; }

    .modal { max-width: 540px; padding: 30px; max-height: 90vh; overflow-y: auto; }
    .modal h3 { font-size: 19px; font-weight: 800; margin-bottom: 22px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
  `]
})
export class ClientesListComponent implements OnInit {
  clientes: Cliente[] = [];
  busca = '';
  modalAberto = false;
  editandoId: string | null = null;
  form: ClienteRequest = { ...CLIENTE_VAZIO };
  erro = '';
  salvando = false;
  private buscaTimeout: any;

  constructor(private service: ClientesService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.service.listar(this.busca || undefined).subscribe(c => this.clientes = c);
  }

  buscar(): void {
    clearTimeout(this.buscaTimeout);
    this.buscaTimeout = setTimeout(() => this.carregar(), 300);
  }

  abrirNovo(): void {
    this.editandoId = null;
    this.form = { ...CLIENTE_VAZIO };
    this.erro = '';
    this.modalAberto = true;
  }

  abrirEditar(c: Cliente): void {
    this.editandoId = c.id;
    this.form = {
      nome: c.nome, documentoTipo: c.documentoTipo, documento: c.documento,
      email: c.email, telefone: c.telefone, endereco: c.endereco,
      cnh: c.cnh, validadeCNH: c.validadeCNH?.substring(0, 10)
    };
    this.erro = '';
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
  }

  salvar(): void {
    this.erro = '';
    this.salvando = true;
    const acao: Observable<unknown> = this.editandoId
      ? this.service.atualizar(this.editandoId, this.form)
      : this.service.criar(this.form);

    acao.subscribe({
      next: () => {
        this.salvando = false;
        this.modalAberto = false;
        this.carregar();
      },
      error: () => {
        this.salvando = false;
        this.erro = 'Não foi possível salvar. Verifique os dados (documento duplicado?).';
      }
    });
  }

  remover(c: Cliente): void {
    if (!confirm(`Excluir o cliente ${c.nome}?`)) return;
    this.service.remover(c.id).subscribe(() => this.carregar());
  }
}
