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
        <p class="subtitle">{{ veiculos.length }} veículo(s) cadastrado(s)</p>
      </div>
      <button class="btn btn-primary" (click)="abrirNovo()">+ Novo veículo</button>
    </div>

    <div class="filters">
      <button class="btn" [class.btn-primary]="filtroStatus === ''" [class.btn-secondary]="filtroStatus !== ''" (click)="filtrar('')">Todos</button>
      <button class="btn" [class.btn-primary]="filtroStatus === 'Disponivel'" [class.btn-secondary]="filtroStatus !== 'Disponivel'" (click)="filtrar('Disponivel')">Disponíveis</button>
      <button class="btn" [class.btn-primary]="filtroStatus === 'Locado'" [class.btn-secondary]="filtroStatus !== 'Locado'" (click)="filtrar('Locado')">Locados</button>
      <button class="btn" [class.btn-primary]="filtroStatus === 'Manutencao'" [class.btn-secondary]="filtroStatus !== 'Manutencao'" (click)="filtrar('Manutencao')">Manutenção</button>
    </div>

    <div class="grid" *ngIf="veiculos.length > 0; else vazio">
      <div class="veiculo-card card" *ngFor="let v of veiculos">
        <div class="thumb" [style.background-image]="v.imagemUrl ? 'url(' + v.imagemUrl + ')' : ''">
          <span *ngIf="!v.imagemUrl">🚗</span>
        </div>
        <div class="body">
          <div class="top-row">
            <strong>{{ v.marca }} {{ v.modelo }}</strong>
            <span class="badge" [ngClass]="statusClass(v.status)">{{ statusLabel(v.status) }}</span>
          </div>
          <p class="placa">{{ v.placa }} · {{ v.anoModelo || '—' }} · {{ v.cor || '—' }}</p>
          <p class="valor">{{ v.valorDiaria | currency:'BRL' }}<span>/dia</span></p>
          <div class="actions">
            <button class="btn btn-secondary" (click)="abrirEditar(v)">Editar</button>
            <label class="btn btn-secondary upload-btn">
              Foto
              <input type="file" accept="image/*" (change)="enviarImagem(v, $event)" hidden />
            </label>
            <button class="btn btn-danger" (click)="remover(v)">Excluir</button>
          </div>
        </div>
      </div>
    </div>
    <ng-template #vazio>
      <div class="empty-state card">Nenhum veículo encontrado. Cadastre o primeiro clicando em "Novo veículo".</div>
    </ng-template>

    <!-- Modal de cadastro/edição -->
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
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    h2 { font-size: 22px; font-weight: 700; }
    .subtitle { color: var(--color-text-muted); font-size: 13px; margin-top: 4px; }
    .filters { display: flex; gap: 8px; margin: 20px 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-top: 8px; }
    .veiculo-card { overflow: hidden; }
    .thumb {
      height: 130px; background-color: var(--color-primary-light); background-size: cover; background-position: center;
      display: flex; align-items: center; justify-content: center; font-size: 40px;
    }
    .body { padding: 16px; }
    .top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .placa { color: var(--color-text-muted); font-size: 13px; margin-bottom: 8px; }
    .valor { font-size: 18px; font-weight: 700; color: var(--color-primary); margin-bottom: 12px; }
    .valor span { font-size: 12px; font-weight: 500; color: var(--color-text-muted); }
    .actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .actions .btn { padding: 6px 10px; font-size: 12px; }
    .upload-btn { cursor: pointer; }

    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(15,23,42,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px;
    }
    .modal { width: 100%; max-width: 520px; padding: 28px; max-height: 90vh; overflow-y: auto; }
    .modal h3 { font-size: 18px; margin-bottom: 20px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
  `]
})
export class VeiculosListComponent implements OnInit {
  veiculos: Veiculo[] = [];
  filtroStatus = '';
  modalAberto = false;
  editandoId: string | null = null;
  form: VeiculoRequest = { ...VEICULO_VAZIO };
  erro = '';
  salvando = false;

  constructor(private service: VeiculosService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.service.listar(this.filtroStatus || undefined).subscribe(v => this.veiculos = v);
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
