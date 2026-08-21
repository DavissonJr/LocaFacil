import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VeiculosService } from './veiculos.service';
import { Veiculo, VeiculoRequest } from '../../core/models/veiculo.model';
import { maskPlaca } from '../../core/utils/mask.util';
import { backdropFade, modalSpring } from '../../core/animations/fluid.animations';
import { DialogService } from '../../core/services/dialog.service';

const VEICULO_VAZIO: VeiculoRequest = {
  placa: '', marca: '', modelo: '', cor: '', categoria: '',
  valorDiaria: 0, kmAtual: 0, status: 'Disponivel'
};

interface FotoStaged {
  file: File;
  previewUrl: string;
}

interface FotoExistente {
  id: string;
  url: string;
}

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
        <div class="thumb" (click)="abrirEditar(v)">
          <img *ngIf="v.fotos[0] && !fotosComErro.has(v.id)" [src]="v.fotos[0].url" alt="Foto do veículo" (error)="onImgError(v.id)" />
          <svg *ngIf="!v.fotos[0] || fotosComErro.has(v.id)" viewBox="0 0 24 24" fill="none"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11m-14 0h14m-14 0a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="15.5" r="1" fill="currentColor"/><circle cx="16.5" cy="15.5" r="1" fill="currentColor"/></svg>
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
            <button class="btn btn-secondary" (click)="abrirEditar(v)" title="Editar / ver fotos">
              <svg viewBox="0 0 24 24" fill="none"><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
              Editar
            </button>
            <button class="btn btn-danger icon-only" (click)="remover(v)" title="Excluir">
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
    <div class="modal-backdrop" *ngIf="modalAberto" (click)="fecharModal()" @backdropFade>
      <div class="modal card" (click)="$event.stopPropagation()" @modalSpring>
        <h3>{{ editandoId ? 'Editar veículo' : 'Novo veículo' }}</h3>

        <div class="grid-2">
          <div class="form-field"><label>Placa</label><input [ngModel]="form.placa" (ngModelChange)="onPlacaChange($event)" name="placa" required placeholder="ABC1234 ou ABC1D23" maxlength="7" /></div>
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

        <p class="section-label">Fotos do veículo</p>
        <p class="section-hint">Mostre o estado atual — lataria, interior, painel, pneus. A primeira foto vira a capa do card.</p>

        <label class="dropzone" [class.uploading]="enviandoFoto">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 16V4m0 0-4 4m4-4 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          <span>{{ enviandoFoto ? 'Enviando...' : 'Clique ou arraste fotos aqui' }}</span>
          <small>JPEG, PNG ou WEBP · pode selecionar várias de uma vez</small>
          <input type="file" accept="image/*" multiple hidden (change)="onFotosSelecionadas($event)" [disabled]="enviandoFoto" />
        </label>

        <div class="fotos-grid" *ngIf="fotosExistentes.length || fotosNovas.length">
          <div class="foto-item" *ngFor="let f of fotosExistentes; let i = index" [class.capa]="i === 0 && fotosNovas.length === 0">
            <img [src]="f.url" alt="Foto do veículo" />
            <span class="capa-badge" *ngIf="i === 0 && fotosNovas.length === 0">Capa</span>
            <button class="remove-btn" (click)="removerFotoExistente(f.id)" title="Remover">
              <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="foto-item" *ngFor="let f of fotosNovas; let i = index" [class.capa]="fotosExistentes.length === 0 && i === 0">
            <img [src]="f.previewUrl" alt="Nova foto" />
            <span class="capa-badge" *ngIf="fotosExistentes.length === 0 && i === 0">Capa</span>
            <span class="pending-badge">Nova</span>
            <button class="remove-btn" (click)="removerFotoNova(i)" title="Remover">
              <svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
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
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    h2 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    .subtitle { color: var(--color-text-muted); font-size: 14px; margin-top: 4px; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
    @media (max-width: 640px) { .stats { grid-template-columns: repeat(2, 1fr); } }
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
      background-color: var(--color-muted-bg);
      display: flex; align-items: center; justify-content: center; color: var(--color-text-faint);
    }
    .thumb img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .thumb svg { width: 40px; height: 40px; position: relative; z-index: 1; }
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
    .actions .btn { padding: 8px 12px; flex: 1; justify-content: center; font-size: 13px; }
    .actions .btn svg { width: 15px; height: 15px; }
    .icon-only { flex: 0 0 auto !important; padding: 8px !important; }

    .modal { max-width: 640px; padding: 30px; max-height: 92vh; overflow-y: auto; overflow-x: hidden; }
    .modal h3 { font-size: 19px; font-weight: 800; margin-bottom: 22px; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 16px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }

    .section-label { font-size: 12.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-primary-bright); margin-bottom: 4px; }
    .section-hint { font-size: 12.5px; color: var(--color-text-muted); margin-bottom: 14px; }

    .dropzone {
      display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center;
      border: 1.5px dashed var(--color-border-bright); border-radius: var(--radius);
      padding: 24px 20px; cursor: pointer; transition: all 0.2s var(--ease);
      color: var(--color-text-muted); margin-bottom: 16px;
    }
    .dropzone:hover { border-color: var(--color-primary); background: var(--color-primary-glow); color: var(--color-text); }
    .dropzone svg { width: 24px; height: 24px; color: var(--color-primary-bright); }
    .dropzone span { font-size: 13.5px; font-weight: 700; color: var(--color-text); }
    .dropzone small { font-size: 11.5px; }
    .dropzone.uploading { opacity: 0.6; pointer-events: none; }

    .fotos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 10px; margin-bottom: 20px; }
    .foto-item { position: relative; aspect-ratio: 1; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--color-border); }
    .foto-item.capa { border-color: var(--color-primary); box-shadow: 0 0 0 2px var(--color-primary-glow); }
    .foto-item img { width: 100%; height: 100%; object-fit: cover; }
    .capa-badge, .pending-badge {
      position: absolute; bottom: 5px; left: 5px; font-size: 9.5px; font-weight: 800; text-transform: uppercase;
      padding: 2px 7px; border-radius: 999px; color: white;
    }
    .capa-badge { background: var(--color-primary); }
    .pending-badge { background: rgba(8,9,13,0.85); left: auto; right: 5px; bottom: 5px; }
    .remove-btn {
      position: absolute; top: 5px; right: 5px; width: 22px; height: 22px; border-radius: 50%;
      background: rgba(8,9,13,0.85); border: none; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.15s;
    }
    .remove-btn svg { width: 12px; height: 12px; }
    .remove-btn:hover { background: var(--color-danger); }
  `],
  animations: [backdropFade, modalSpring]
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
  enviandoFoto = false;

  fotosExistentes: FotoExistente[] = []; // fotos já salvas no servidor (modo edição)
  fotosNovas: FotoStaged[] = [];          // fotos escolhidas nesta sessão, ainda não enviadas

  fotosComErro = new Set<string>();

  constructor(private service: VeiculosService, private dialog: DialogService) {}

  onImgError(veiculoId: string): void {
    this.fotosComErro.add(veiculoId);
  }

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

  onPlacaChange(valor: string): void {
    this.form.placa = maskPlaca(valor);
  }

  abrirNovo(): void {
    this.editandoId = null;
    this.form = { ...VEICULO_VAZIO };
    this.fotosExistentes = [];
    this.limparFotosNovas();
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
    this.fotosExistentes = v.fotos.map(f => ({ id: f.id, url: f.url }));
    this.limparFotosNovas();
    this.erro = '';
    this.modalAberto = true;
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.limparFotosNovas();
  }

  private limparFotosNovas(): void {
    this.fotosNovas.forEach(f => URL.revokeObjectURL(f.previewUrl));
    this.fotosNovas = [];
  }

  onFotosSelecionadas(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivos = input.files;
    if (!arquivos || arquivos.length === 0) return;

    for (const file of Array.from(arquivos)) {
      this.fotosNovas.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    input.value = '';
  }

  removerFotoNova(index: number): void {
    URL.revokeObjectURL(this.fotosNovas[index].previewUrl);
    this.fotosNovas.splice(index, 1);
  }

  removerFotoExistente(fotoId: string): void {
    if (!this.editandoId) return;
    this.service.removerFoto(this.editandoId, fotoId).subscribe(() => {
      this.fotosExistentes = this.fotosExistentes.filter(f => f.id !== fotoId);
    });
  }

  salvar(): void {
    this.erro = '';
    this.salvando = true;

    if (this.editandoId) {
      this.service.atualizar(this.editandoId, this.form).subscribe({
        next: () => this.enviarFotosPendentes(this.editandoId!),
        error: (err) => this.tratarErroSalvar(err)
      });
    } else {
      this.service.criar(this.form).subscribe({
        next: (criado) => this.enviarFotosPendentes(criado.id),
        error: (err) => this.tratarErroSalvar(err)
      });
    }
  }

  private tratarErroSalvar(err: any): void {
    this.salvando = false;
    this.erro = err.error?.erro ?? 'Não foi possível salvar o veículo.';
  }

  private enviarFotosPendentes(veiculoId: string): void {
    if (this.fotosNovas.length === 0) {
      this.finalizarSalvar();
      return;
    }

    this.enviandoFoto = true;
    this.enviarFotosSequencialmente([...this.fotosNovas], veiculoId, 0);
  }

  private enviarFotosSequencialmente(lista: FotoStaged[], veiculoId: string, index: number): void {
    if (index >= lista.length) {
      this.enviandoFoto = false;
      this.finalizarSalvar();
      return;
    }
    this.service.uploadImagem(veiculoId, lista[index].file).subscribe({
      next: () => this.enviarFotosSequencialmente(lista, veiculoId, index + 1),
      error: async () => {
        await this.dialog.alert(`Não foi possível enviar a imagem "${lista[index].file.name}".`, { tone: 'danger' });
        this.enviarFotosSequencialmente(lista, veiculoId, index + 1);
      }
    });
  }

  private finalizarSalvar(): void {
    this.salvando = false;
    this.modalAberto = false;
    this.limparFotosNovas();
    this.carregar();
  }

  async remover(v: Veiculo): Promise<void> {
    const ok = await this.dialog.confirm(`Excluir o veículo ${v.marca} ${v.modelo} (${v.placa})? Essa ação não pode ser desfeita.`, { title: 'Excluir veículo' });
    if (!ok) return;
    this.service.remover(v.id).subscribe({
      next: () => this.carregar(),
      error: async (err) => this.dialog.alert(err.error?.erro ?? 'Não foi possível excluir o veículo.', { tone: 'danger' })
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
