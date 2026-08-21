import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContratosService } from './contratos.service';
import { VeiculosService } from '../veiculos/veiculos.service';
import { ClientesService } from '../clientes/clientes.service';
import { Contrato, ContratoRequest } from '../../core/models/contrato.model';
import { Veiculo } from '../../core/models/veiculo.model';
import { Cliente } from '../../core/models/cliente.model';

@Component({
  selector: 'app-contratos-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div>
        <h2>Contratos de locação</h2>
        <p class="subtitle">{{ contratos.length }} contrato(s)</p>
      </div>
      <button class="btn btn-primary" (click)="abrirNovo()">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
        Nova locação
      </button>
    </div>

    <div class="filters">
      <button class="btn" [class.btn-primary]="filtroStatus === ''" [class.btn-secondary]="filtroStatus !== ''" (click)="filtrar('')">Todos</button>
      <button class="btn" [class.btn-primary]="filtroStatus === 'Ativo'" [class.btn-secondary]="filtroStatus !== 'Ativo'" (click)="filtrar('Ativo')">Ativos</button>
      <button class="btn" [class.btn-primary]="filtroStatus === 'Finalizado'" [class.btn-secondary]="filtroStatus !== 'Finalizado'" (click)="filtrar('Finalizado')">Finalizados</button>
    </div>

    <div class="card" *ngIf="contratos.length > 0; else vazio">
      <table>
        <thead>
          <tr><th>Veículo</th><th>Cliente</th><th>Início</th><th>Previsão fim</th><th>Valor</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of contratos">
            <td>{{ c.veiculoDescricao }}</td>
            <td>{{ c.clienteNome }}</td>
            <td>{{ c.dataInicio | date:'dd/MM/yyyy' }}</td>
            <td>{{ c.dataFimPrevista | date:'dd/MM/yyyy' }}</td>
            <td>{{ (c.valorTotal || c.valorDiaria) | currency:'BRL' }}<span class="muted" *ngIf="!c.valorTotal"> /dia</span></td>
            <td><span class="badge" [ngClass]="statusClass(c.status)">{{ c.status }}</span></td>
            <td class="actions">
              <button class="btn btn-secondary" *ngIf="c.status === 'Ativo'" (click)="abrirFinalizar(c)">Finalizar</button>
              <button class="btn btn-danger icon-only" *ngIf="c.status === 'Ativo'" (click)="cancelar(c)" title="Cancelar">
                <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ng-template #vazio>
      <div class="empty-state card">
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none"><path d="M7 4h10a1 1 0 0 1 1 1v15l-3-2-3 2-3-2-3 2V5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
        </div>
        <strong>Nenhum contrato encontrado</strong>
        <p>Crie uma nova locação clicando no botão acima.</p>
      </div>
    </ng-template>

    <!-- Modal nova locação -->
    <div class="modal-backdrop" *ngIf="modalNovoAberto" (click)="fecharModais()">
      <div class="modal card" (click)="$event.stopPropagation()">
        <h3>Nova locação</h3>

        <div class="form-field">
          <label>Veículo (apenas disponíveis)</label>
          <select [(ngModel)]="form.veiculoId" name="veiculoId" (ngModelChange)="onVeiculoChange()">
            <option [ngValue]="''">Selecione...</option>
            <option *ngFor="let v of veiculosDisponiveis" [ngValue]="v.id">{{ v.marca }} {{ v.modelo }} - {{ v.placa }} ({{ v.valorDiaria | currency:'BRL' }}/dia)</option>
          </select>
        </div>

        <div class="form-field">
          <label>Cliente</label>
          <select [(ngModel)]="form.clienteId" name="clienteId">
            <option [ngValue]="''">Selecione...</option>
            <option *ngFor="let c of clientes" [ngValue]="c.id">{{ c.nome }} ({{ c.documento }})</option>
          </select>
        </div>

        <div class="grid-2">
          <div class="form-field"><label>Data de início</label><input type="date" [(ngModel)]="form.dataInicio" name="dataInicio" required /></div>
          <div class="form-field"><label>Previsão de fim</label><input type="date" [(ngModel)]="form.dataFimPrevista" name="dataFimPrevista" required /></div>
        </div>
        <div class="grid-2">
          <div class="form-field"><label>Km inicial</label><input type="number" [(ngModel)]="form.kmInicial" name="kmInicial" required /></div>
          <div class="form-field"><label>Valor diária (R$)</label><input type="number" step="0.01" [(ngModel)]="form.valorDiaria" name="valorDiaria" required /></div>
        </div>
        <div class="form-field"><label>Observações</label><textarea rows="2" [(ngModel)]="form.observacoes" name="observacoes"></textarea></div>

        <p class="error-msg" *ngIf="erro">{{ erro }}</p>

        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="fecharModais()">Cancelar</button>
          <button class="btn btn-primary" (click)="salvar()" [disabled]="salvando">{{ salvando ? 'Salvando...' : 'Criar locação' }}</button>
        </div>
      </div>
    </div>

    <!-- Modal finalizar -->
    <div class="modal-backdrop" *ngIf="modalFinalizarAberto" (click)="fecharModais()">
      <div class="modal card small" (click)="$event.stopPropagation()">
        <h3>Finalizar locação</h3>
        <p class="muted">{{ contratoSelecionado?.veiculoDescricao }} — {{ contratoSelecionado?.clienteNome }}</p>
        <div class="form-field">
          <label>Km final</label>
          <input type="number" [(ngModel)]="kmFinal" name="kmFinal" [min]="contratoSelecionado?.kmInicial ?? 0" required />
        </div>
        <p class="error-msg" *ngIf="erro">{{ erro }}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="fecharModais()">Cancelar</button>
          <button class="btn btn-primary" (click)="confirmarFinalizar()" [disabled]="salvando">{{ salvando ? 'Finalizando...' : 'Finalizar locação' }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    h2 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .subtitle { color: var(--color-text-muted); font-size: 14px; margin-top: 4px; }
    .filters { display: flex; gap: 8px; margin: 20px 0 22px; }
    .muted { color: var(--color-text-muted); font-size: 12px; }
    .actions { display: flex; gap: 8px; justify-content: flex-end; }
    .actions .btn { padding: 8px 14px; font-size: 13px; }
    .icon-only { padding: 8px; }
    .icon-only svg { width: 14px; height: 14px; }

    .modal { max-width: 540px; padding: 30px; max-height: 90vh; overflow-y: auto; }
    .modal.small { max-width: 400px; }
    .modal h3 { font-size: 19px; font-weight: 800; margin-bottom: 8px; }
    .modal .muted { margin-bottom: 20px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
  `]
})
export class ContratosListComponent implements OnInit {
  contratos: Contrato[] = [];
  veiculosDisponiveis: Veiculo[] = [];
  clientes: Cliente[] = [];
  filtroStatus = '';

  modalNovoAberto = false;
  modalFinalizarAberto = false;
  contratoSelecionado: Contrato | null = null;
  kmFinal = 0;

  form: ContratoRequest = {
    veiculoId: '', clienteId: '', dataInicio: '', dataFimPrevista: '', kmInicial: 0, valorDiaria: 0, observacoes: ''
  };
  erro = '';
  salvando = false;

  constructor(
    private service: ContratosService,
    private veiculosService: VeiculosService,
    private clientesService: ClientesService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.service.listar(this.filtroStatus || undefined).subscribe(c => this.contratos = c);
  }

  filtrar(status: string): void {
    this.filtroStatus = status;
    this.carregar();
  }

  abrirNovo(): void {
    this.form = { veiculoId: '', clienteId: '', dataInicio: '', dataFimPrevista: '', kmInicial: 0, valorDiaria: 0, observacoes: '' };
    this.erro = '';
    this.veiculosService.listar('Disponivel').subscribe(v => this.veiculosDisponiveis = v);
    this.clientesService.listar().subscribe(c => this.clientes = c);
    this.modalNovoAberto = true;
  }

  onVeiculoChange(): void {
    const v = this.veiculosDisponiveis.find(v => v.id === this.form.veiculoId);
    if (v) {
      this.form.valorDiaria = v.valorDiaria;
      this.form.kmInicial = v.kmAtual;
    }
  }

  salvar(): void {
    this.erro = '';
    this.salvando = true;
    this.service.criar(this.form).subscribe({
      next: () => {
        this.salvando = false;
        this.modalNovoAberto = false;
        this.carregar();
      },
      error: (err) => {
        this.salvando = false;
        this.erro = err.error?.erro ?? 'Não foi possível criar a locação.';
      }
    });
  }

  abrirFinalizar(c: Contrato): void {
    this.contratoSelecionado = c;
    this.kmFinal = c.kmInicial;
    this.erro = '';
    this.modalFinalizarAberto = true;
  }

  confirmarFinalizar(): void {
    if (!this.contratoSelecionado) return;
    this.erro = '';
    this.salvando = true;
    this.service.finalizar(this.contratoSelecionado.id, this.kmFinal).subscribe({
      next: () => {
        this.salvando = false;
        this.modalFinalizarAberto = false;
        this.carregar();
      },
      error: (err) => {
        this.salvando = false;
        this.erro = err.error?.erro ?? 'Não foi possível finalizar a locação.';
      }
    });
  }

  cancelar(c: Contrato): void {
    if (!confirm('Cancelar esta locação?')) return;
    this.service.cancelar(c.id).subscribe(() => this.carregar());
  }

  fecharModais(): void {
    this.modalNovoAberto = false;
    this.modalFinalizarAberto = false;
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = { Ativo: 'badge-warning', Finalizado: 'badge-success', Cancelado: 'badge-danger' };
    return classes[status] ?? 'badge-muted';
  }
}
