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
      <button class="btn btn-primary" (click)="abrirNovo()">+ Novo cliente</button>
    </div>

    <div class="search">
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
              <button class="btn btn-secondary" (click)="abrirEditar(c)">Editar</button>
              <button class="btn btn-danger" (click)="remover(c)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ng-template #vazio>
      <div class="empty-state card">Nenhum cliente encontrado.</div>
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
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    h2 { font-size: 22px; font-weight: 700; }
    .subtitle { color: var(--color-text-muted); font-size: 13px; margin-top: 4px; }
    .search { margin-bottom: 20px; }
    .search input { width: 100%; max-width: 360px; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 14px; }
    .muted { color: var(--color-text-muted); font-size: 12px; }
    .actions { display: flex; gap: 8px; }
    .actions .btn { padding: 6px 10px; font-size: 12px; }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(15,23,42,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px;
    }
    .modal { width: 100%; max-width: 520px; padding: 28px; max-height: 90vh; overflow-y: auto; }
    .modal h3 { font-size: 18px; margin-bottom: 20px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
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
