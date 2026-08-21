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
      <div class="veiculo-card card stagger-item" *ngFor="let v of veiculos; let i = index" [style.animation-delay.ms]="i * 45">
        <div class="thumb" [style.background-image]="v.fotos[0] ? 'url(' + v.fotos[0].url + ')' : ''" (click)="abrirFotos(v)">
          <svg *ngIf="!v.fotos[0]" viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="15.5" r="1" fill="currentColor"/><circle cx="16.5" cy="15.5" r="1" fill="currentColor"/></svg>
          <span class="badge thumb-badge" [ngClass]="statusClass(v.status)">{{ statusLabel(v.status) }}</span>
          <span class="thumb-count" *ngIf="v.fotos.length > 0">
            <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="10" r="1.5" fill="currentColor"/></svg>
            {{ v.fotos.length }}
          </span>
        </div>
        <div class="body">
          <strong class="title">{{ v.marca }} {{ v.modelo }}</strong>
          <p class="placa">{{ v.placa }} · {{ v.anoModelo || '—' }} · {{ v.cor || '—' }}</p>
          <p class="valor">{{ v.valorDiaria | currency:'BRL' }}<span>/dia</span></p>
          <div class="actions">
            <button class="btn btn-secondary" (click)="abrirEditar(v)" title="Editar">
              <svg viewBox="0 0 24 24" fill="none"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
            </button>
            <button class="btn btn-secondary" (click)="abrirFotos(v)" title="Fotos">
              <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><circle cx="8.5" cy="10" r="1.5" stroke="currentColor" stroke-width="1.5"/><path d="m5 17 4.5-4.5a1.5 1.5 0 0 1 2 0L15 16l1.5-1.5a1.5 1.5 0 0 1 2 0L21 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
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

    <!-- Modal cadastro/edição -->
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

    <!-- Modal galeria de fotos -->
    <div class="modal-backdrop" *ngIf="modalFotosAberto" (click)="fecharFotos()">
      <div class="modal card fotos-modal" (click)="$event.stopPropagation()">
        <h3>Fotos do veículo</h3>
        <p class="muted">{{ veiculoSelecionado?.marca }} {{ veiculoSelecionado?.modelo }} — {{ veiculoSelecionado?.placa }}</p>

        <label class="dropzone" [class.uploading]="enviandoFoto">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 16V4m0 0-4 4m4-4 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          <span>{{ enviandoFoto ? 'Enviando...' : 'Clique ou arraste fotos aqui' }}</span>
          <small>Mostre o estado atual do veículo — lataria, interior, painel, pneus. JPEG, PNG ou WEBP.</small>
          <input type="file" accept="image/*" multiple hidden (change)="enviarFotos($event)" [disabled]="enviandoFoto" />
        </label>

        <div class="fotos-grid" *ngIf="veiculoSelecionado?.fotos?.length">
          <div class="foto-item" *ngFor="let f of veiculoSelecionado?.fotos">
            <img [src]="f.url" alt="Foto do veículo" />
            <button class="remove-btn" (click)="removerFoto(f.id)" title="Remover">
              <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>
        <p class="empty-fotos" *ngIf="!veiculoSelecionado?.fotos?.length">Nenhuma foto enviada ainda.</p>

        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="fecharFotos()">Fechar</button>
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
      padding: 17px 19px; cursor: pointer; transition: all 0.18s var(--ease);
      display: flex; flex-direction: column; gap: 2px;
    }
    .stat-card:hover { border-color: var(--color-border-bright); transform: translateY(-2px); box-shadow: var(--shadow); }
    .stat-card.selected { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-glow); }
    .stat-value { font-size: 27px; font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
    .stat-label { font-size: 12.5px; color: var(--color-text-muted); font-weight: 600; }
    .stat-card.success .stat-value { color: var(--color-success); }
    .stat-card.warning .stat-value { color: var(--color-warning); }
    .stat-card.danger .stat-value { color: var(--color-danger); }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 18px; }
    .veiculo-card { overflow: hidden; transition: all 0.22s var(--ease); opacity: 0; }
    .veiculo-card:hover { transform: translateY(-4px); border-color: var(--color-border-bright); box-shadow: var(--shadow-glow); }
    .thumb {
      height: 150px; position: relative; cursor: pointer;
      background-color: var(--color-muted-bg); background-size: cover; background-position: center;
      display: flex; align-items: center; justify-content: center; color: var(--color-text-faint);
    }
    .thumb svg { width: 40px; height: 40px; }
    .thumb-badge { position: absolute; top: 10px; right: 10px; background: rgba(8,9,13,0.85); backdrop-filter: blur(4px); }
    .thumb-count {
      position: absolute; bottom: 10px; left: 10px;
      background: rgba(8,9,13,0.85); backdrop-filter: blur(4px); color: white;
      font-size: 11px; font-weight: 700; padding: 4px 9px; border-radius: 999px;
      display: flex; align-items: center; gap: 4px;
    }
    .body { padding: 16px 18px 18px; }
    .title { font-size: 15.5px; font-weight: 700; display: block; }
    .placa { color: var(--color-text-muted); font-size: 12.5px; margin: 4px 0 10px; }
    .valor { font-size: 19px; font-weight: 800; color: var(--color-primary-bright); margin-bottom: 14px; }
    .valor span { font-size: 12px; font-weight: 600; color: var(--color-text-muted); }
    .actions { display: flex; gap: 8px; }
    .actions .btn { padding: 8px; flex: 1; justify-content: center; }
    .actions .btn svg { width: 15px; height: 15px; }

    .modal { max-width: 540px; padding: 30px; max-height: 90vh; overflow-y: auto; }
    .modal h3 { font-size: 19px; font-weight: 800; margin-bottom: 6px; }
    .muted { color: var(--color-text-muted); font-size: 13px; margin-bottom: 20px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }

    .fotos-modal { max-width: 600px; }
    .dropzone {
      display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center;
      border: 1.5px dashed var(--color-border-bright); border-radius: var(--radius);
      padding: 30px 20px; cursor: pointer; transition: all 0.2s var(--ease);
      color: var(--color-text-muted); margin-bottom: 20px;
    }
    .dropzone:hover { border-color: var(--color-primary); background: var(--color-primary-glow); color: var(--color-text); }
    .dropzone svg { width: 26px; height: 26px; color: var(--color-primary-bright); }
    .dropzone span { font-size: 14px; font-weight: 700; color: var(--color-text); }
    .dropzone small { font-size: 12px; max-width: 340px; }
    .dropzone.uploading { opacity: 0.6; pointer-events: none; }

    .fotos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .foto-item { position: relative; aspect-ratio: 1; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--color-border); }
    .foto-item img { width: 100%; height: 100%; object-fit: cover; }
    .remove-btn {
      position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 50%;
      background: rgba(8,9,13,0.85); border: none; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.15s;
    }
    .remove-btn svg { width: 13px; height: 13px; }
    .remove-btn:hover { background: var(--color-danger); }
    .empty-fotos { text-align: center; color: var(--color-text-faint); font-size: 13px; padding: 20px 0; }
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

  modalFotosAberto = false;
  veiculoSelecionado: Veiculo | null = null;
  enviandoFoto = false;

  constructor(private service: VeiculosService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.service.listar(this.filtroStatus || undefined).subscribe(v => this.veiculos = v);
    this.service.listar().subscribe(all => this.todos = all);
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

  abrirFotos(v: Veiculo): void {
    this.veiculoSelecionado = v;
    this.modalFotosAberto = true;
  }

  fecharFotos(): void {
    this.modalFotosAberto = false;
    this.veiculoSelecionado = null;
    this.carregar();
  }

  enviarFotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivos = input.files;
    if (!arquivos || arquivos.length === 0 || !this.veiculoSelecionado) return;

    this.enviandoFoto = true;
    const id = this.veiculoSelecionado.id;
    const lista = Array.from(arquivos);

    const enviarProxima = (index: number) => {
      if (index >= lista.length) {
        this.enviandoFoto = false;
        input.value = '';
        return;
      }
      this.service.uploadImagem(id, lista[index]).subscribe({
        next: (atualizado) => {
          this.veiculoSelecionado = atualizado;
          enviarProxima(index + 1);
        },
        error: () => {
          alert(`Não foi possível enviar a imagem "${lista[index].name}".`);
          enviarProxima(index + 1);
        }
      });
    };
    enviarProxima(0);
  }

  removerFoto(fotoId: string): void {
    if (!this.veiculoSelecionado) return;
    this.service.removerFoto(this.veiculoSelecionado.id, fotoId).subscribe(() => {
      if (this.veiculoSelecionado) {
        this.veiculoSelecionado = {
          ...this.veiculoSelecionado,
          fotos: this.veiculoSelecionado.fotos.filter(f => f.id !== fotoId)
        };
      }
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
