import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { VeiculosService } from './veiculos.service';
import { Veiculo, VeiculoRequest } from '../../core/models/veiculo.model';

const VEICULO_VAZIO: VeiculoRequest = {
  placa: '', marca: '', modelo: '', cor: '', categoria: '',
  valorDiaria: 0, kmAtual: 0, status: 'Disponivel'
};

@Component({
  selector: 'app-veiculos-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div>
        <h2>Veículos</h2>
        <p class="subtitle">Gerencie a frota da sua locadora</p>
      </div>
      <button class="btn btn-primary" (click)="abrirNovo()">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
        Novo veículo
      </button>
    </div>

    <div class="stats">
      <div class="stat-card" (click)="filtrar('')" [class.selected]="filtroStatus === ''">
        <span class="stat-value">{{ todos.length }}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat-card success" (click)="filtrar('Disponivel')" [class.selected]="filtroStatus === 'Disponivel'">
        <span class="stat-value">{{ contarStatus('Disponivel') }}</span>
        <span class="stat-label">Disponíveis</span>
      </div>
      <div class="stat-card warning" (click)="filtrar('Locado')" [class.selected]="filtroStatus === 'Locado'">
        <span class="stat-value">{{ contarStatus('Locado') }}</span>
        <span class="stat-label">Locados</span>
      </div>
      <div class="stat-card danger" (click)="filtrar('Manutencao')" [class.selected]="filtroStatus === 'Manutencao'">
        <span class="stat-value">{{ contarStatus('Manutencao') }}</span>
        <span class="stat-label">Manutenção</span>
      </div>
    </div>

    <div class="grid" *ngIf="veiculos.length > 0; else vazio">
      <div class="veiculo-card card" *ngFor="let v of veiculos">
        <div class="thumb" [style.background-image]="v.imagemUrl ? 'url(' + v.imagemUrl + ')' : ''">
          <svg *ngIf="!v.imagemUrl" viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="15.5" r="1" fill="currentColor"/><circle cx="16.5" cy="15.5" r="1" fill="currentColor"/></svg>
          <span class="badge thumb-badge" [ngClass]="statusClass(v.status)">{{ statusLabel(v.status) }}</span>
        </div>
        <div class="body">
          <strong class="title">{{ v.marca }} {{ v.modelo }}</strong>
          <p class="placa">{{ v.placa }} · {{ v.anoModelo || '—' }} · {{ v.cor || '—' }}</p>
          <p class="valor">{{ v.valorDiaria | currency:'BRL' }}<span>/dia</span></p>
          <div class="actions">
            <button class="btn btn-secondary" (click)="abrirEditar(v)" title="Editar">
              <svg viewBox="0 0 24 24" fill="none"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
            </button>
            <label class="btn btn-secondary upload-btn" title="Enviar foto">
              <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><circle cx="8.5" cy="10" r="1.5" stroke="currentColor" stroke-width="1.5"/><path d="m5 17 4.5-4.5a1.5 1.5 0 0 1 2 0L15 16l1.5-1.5a1.5 1.5 0 0 1 2 0L21 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <input type="file" accept="image/*" (change)="enviarImagem(v, $event)" hidden />
            </label>
            <button class="btn btn-danger" (click)="remover(v)" title="Excluir">
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <ng-template #vazio>
      <div class="empty-state card">
        <div class="icon">
          <svg viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <strong>Nenhum veículo encontrado</strong>
        <p>Cadastre o primeiro clicando em "Novo veículo".</p>
      </div>
    </ng-template>

    <div class="modal-backdrop" *ngIf="modalAberto" (click)="fecharModal()">
      <div class="modal card" (click)="$event.stopPropagation()">
        <h3>{{ editandoId ? 'Editar veículo' : 'Novo veículo' }}</h3>

        <div class="grid-2">
          <div class="form-field"><label>Placa</label><input [(ngModel)]="form.placa" name="placa" required /></div>
          <div class="form-field">
            <label>Status</label>
            <select [(ngModel)]="form.status" name="status">
              <option value="Disponivel">Disponível</option>
              <option value="Locado">Locado</option>
              <option value="Manutencao">Manutenção</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
        </div>
        <div class="grid-2">
          <div class="form-field"><label>Marca</label><input [(ngModel)]="form.marca" name="marca" required /></div>
          <div class="form-field"><label>Modelo</label><input [(ngModel)]="form.modelo" name="modelo" required /></div>
        </div>
        <div class="grid-3">
          <div class="form-field"><label>Ano fabricação</label><input type="number" [(ngModel)]="form.anoFabricacao" name="anoFabricacao" /></div>
          <div class="form-field"><label>Ano modelo</label><input type="number" [(ngModel)]="form.anoModelo" name="anoModelo" /></div>
          <div class="form-field"><label>Cor</label><input [(ngModel)]="form.cor" name="cor" /></div>
        </div>
        <div class="grid-2">
          <div class="form-field"><label>Categoria</label><input [(ngModel)]="form.categoria" name="categoria" placeholder="Popular, SUV..." /></div>
          <div class="form-field"><label>Valor diária (R$)</label><input type="number" step="0.01" [(ngModel)]="form.valorDiaria" name="valorDiaria" required /></div>
        </div>
        <div class="form-field"><label>Km atual</label><input type="number" [(ngModel)]="form.kmAtual" name="kmAtual" /></div>

        <p class="error-msg" *ngIf="erro">{{ erro }}</p>

        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
          <button class="btn btn-primary" (click)="salvar()" [disabled]="salvando">{{ salvando ? 'Salvando...' : 'Salvar' }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h2 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .subtitle { color: var(--color-text-muted); font-size: 14px; margin-top: 4px; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
    .stat-card {
      background: var(--color-surface); border: 1.5px solid var(--color-border); border-radius: var(--radius);
      padding: 16px 18px; cursor: pointer; transition: all 0.15s var(--ease);
      display: flex; flex-direction: column; gap: 2px;
    }
    .stat-card:hover { border-color: #d7d9ea; transform: translateY(-2px); box-shadow: var(--shadow); }
    .stat-card.selected { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-light); }
    .stat-value { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
    .stat-label { font-size: 12.5px; color: var(--color-text-muted); font-weight: 600; }
    .stat-card.success .stat-value { color: var(--color-success); }
    .stat-card.warning .stat-value { color: var(--color-warning); }
    .stat-card.danger .stat-value { color: var(--color-danger); }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 18px; }
    .veiculo-card { overflow: hidden; transition: all 0.2s var(--ease); }
    .veiculo-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
    .thumb {
      height: 140px; position: relative;
      background-color: var(--color-primary-light); background-size: cover; background-position: center;
      display: flex; align-items: center; justify-content: center; color: var(--color-primary); opacity: 0.9;
    }
    .thumb svg { width: 42px; height: 42px; }
    .thumb-badge { position: absolute; top: 10px; right: 10px; background: white; box-shadow: var(--shadow-sm); }
    .body { padding: 16px 18px 18px; }
    .title { font-size: 15.5px; font-weight: 700; display: block; }
    .placa { color: var(--color-text-muted); font-size: 12.5px; margin: 4px 0 10px; }
    .valor { font-size: 19px; font-weight: 800; color: var(--color-primary); margin-bottom: 14px; }
    .valor span { font-size: 12px; font-weight: 600; color: var(--color-text-muted); }
    .actions { display: flex; gap: 8px; }
    .actions .btn { padding: 8px; flex: 1; justify-content: center; }
    .actions .btn svg { width: 15px; height: 15px; }
    .upload-btn { cursor: pointer; }

    .modal { max-width: 540px; padding: 30px; max-height: 90vh; overflow-y: auto; }
    .modal h3 { font-size: 19px; font-weight: 800; margin-bottom: 22px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
  `]
})
export class VeiculosListComponent implements OnInit {
  veiculos: Veiculo[] = [];
  todos: Veiculo[] = [];
  filtroStatus = '';
  modalAberto = false;
  editandoId: string | null = null;
  form: VeiculoRequest = { ...VEICULO_VAZIO };
  erro = '';
  salvando = false;

  constructor(private service: VeiculosService) {}

  ngOnInit(): void {
    this.service.listar().subscribe(v => this.todos = v);
    this.carregar();
  }

  carregar(): void {
    this.service.listar(this.filtroStatus || undefined).subscribe(v => {
      this.veiculos = v;
      this.service.listar().subscribe(all => this.todos = all);
    });
  }

  contarStatus(status: string): number {
    return this.todos.filter(v => v.status === status).length;
  }

  filtrar(status: string): void {
    this.filtroStatus = status;
    this.carregar();
  }

  abrirNovo(): void {
    this.editandoId = null;
    this.form = { ...VEICULO_VAZIO };
    this.erro = '';
    this.modalAberto = true;
  }

  abrirEditar(v: Veiculo): void {
    this.editandoId = v.id;
    this.form = {
      placa: v.placa, marca: v.marca, modelo: v.modelo, anoFabricacao: v.anoFabricacao,
      anoModelo: v.anoModelo, cor: v.cor, categoria: v.categoria, valorDiaria: v.valorDiaria,
      kmAtual: v.kmAtual, status: v.status
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
        this.erro = 'Não foi possível salvar. Verifique os dados (placa duplicada?).';
      }
    });
  }

  remover(v: Veiculo): void {
    if (!confirm(`Excluir o veículo ${v.marca} ${v.modelo} (${v.placa})?`)) return;
    this.service.remover(v.id).subscribe(() => this.carregar());
  }

  enviarImagem(v: Veiculo, event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    this.service.uploadImagem(v.id, arquivo).subscribe({
      next: () => this.carregar(),
      error: () => alert('Não foi possível enviar a imagem.')
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      Disponivel: 'Disponível', Locado: 'Locado', Manutencao: 'Manutenção', Inativo: 'Inativo'
    };
    return labels[status] ?? status;
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      Disponivel: 'badge-success', Locado: 'badge-warning', Manutencao: 'badge-danger', Inativo: 'badge-muted'
    };
    return classes[status] ?? 'badge-muted';
  }
}
