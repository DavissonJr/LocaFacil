import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ClientesService } from './clientes.service';
import { backdropFade, modalSpring } from '../../core/animations/fluid.animations';
import { Cliente, ClienteRequest } from '../../core/models/cliente.model';
import { maskDocumento, maskTelefone } from '../../core/utils/mask.util';
import { DialogService } from '../../core/services/dialog.service';

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

    <div class="card table-wrap" *ngIf="clientes.length > 0; else vazio">
      <table>
        <thead>
          <tr><th>Nome</th><th>Documento</th><th>Contato</th><th>CNH</th><th>Doc.</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of clientes">
            <td><strong>{{ c.nome }}</strong></td>
            <td>{{ c.documentoTipo }}: {{ maskDocumento(c.documento, c.documentoTipo) }}</td>
            <td>{{ c.telefone || '—' }}<br /><span class="muted">{{ c.email || '' }}</span></td>
            <td>{{ c.cnh || '—' }}</td>
            <td>
              <div class="doc-thumb" (click)="abrirDocumento(c)" [class.has-doc]="c.documentoImagemUrl">
                <img *ngIf="c.documentoImagemUrl" [src]="c.documentoImagemUrl" alt="Documento" />
                <svg *ngIf="!c.documentoImagemUrl" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="12" r="2" stroke="currentColor" stroke-width="1.4"/><path d="M13 10h6M13 14h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              </div>
            </td>
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

    <!-- Modal cadastro/edição -->
    <div class="modal-backdrop" *ngIf="modalAberto" (click)="fecharModal()" @backdropFade>
      <div class="modal card" (click)="$event.stopPropagation()" @modalSpring>
        <h3>{{ editandoId ? 'Editar cliente' : 'Novo cliente' }}</h3>

        <div class="form-field"><label>Nome completo</label><input [(ngModel)]="form.nome" name="nome" required /></div>
        <div class="grid-2">
          <div class="form-field">
            <label>Tipo de documento</label>
            <select [(ngModel)]="form.documentoTipo" name="documentoTipo" (ngModelChange)="onDocumentoChange(form.documento)">
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
            </select>
          </div>
          <div class="form-field">
            <label>Número</label>
            <input [ngModel]="form.documento" (ngModelChange)="onDocumentoChange($event)" name="documento" required
                   [placeholder]="form.documentoTipo === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'"
                   [maxlength]="form.documentoTipo === 'CPF' ? 14 : 18" />
          </div>
        </div>
        <div class="grid-2">
          <div class="form-field"><label>E-mail</label><input type="email" [(ngModel)]="form.email" name="email" /></div>
          <div class="form-field"><label>Telefone</label><input [ngModel]="form.telefone" (ngModelChange)="onTelefoneChange($event)" name="telefone" placeholder="(00) 00000-0000" maxlength="15" /></div>
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

    <!-- Modal documento -->
    <div class="modal-backdrop" *ngIf="modalDocumentoAberto" (click)="fecharDocumento()" @backdropFade>
      <div class="modal card doc-modal" (click)="$event.stopPropagation()" @modalSpring>
        <h3>Documento de identificação</h3>
        <p class="muted">{{ clienteSelecionado?.nome }}</p>

        <div class="instructions">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          <div>
            <strong>Como tirar a foto</strong>
            <p>Envie uma foto do RG, CNH ou outro documento com foto, <strong>na horizontal</strong> (formato deitado), com boa iluminação, sem reflexos e mostrando o documento inteiro, sem cortes.</p>
          </div>
        </div>

        <label class="doc-frame" [class.uploading]="enviandoDocumento" [class.filled]="!!previewUrl">
          <img *ngIf="previewUrl" [src]="previewUrl" alt="Documento enviado" />
          <ng-container *ngIf="!previewUrl">
            <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="12" r="2" stroke="currentColor" stroke-width="1.3"/><path d="M13 10h6M13 14h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
            <span>{{ enviandoDocumento ? 'Enviando...' : 'Clique para enviar o documento' }}</span>
            <small>Formato deitado · JPEG, PNG ou WEBP</small>
          </ng-container>
          <div class="frame-corner tl"></div>
          <div class="frame-corner tr"></div>
          <div class="frame-corner bl"></div>
          <div class="frame-corner br"></div>
          <input type="file" accept="image/*" hidden (change)="enviarDocumento($event)" [disabled]="enviandoDocumento" />
        </label>
        <label class="btn btn-secondary troca-btn" *ngIf="previewUrl">
          Trocar documento
          <input type="file" accept="image/*" hidden (change)="enviarDocumento($event)" />
        </label>

        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="fecharDocumento()">Fechar</button>
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
    .search input { width: 100%; padding: 11px 14px 11px 38px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 14px; background: var(--color-bg-elevated); transition: all 0.15s; }
    .search input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 4px var(--color-primary-glow); }
    .muted { color: var(--color-text-muted); font-size: 12px; }
    .actions { display: flex; gap: 8px; }
    .actions .btn { padding: 8px; }
    .actions .btn svg { width: 15px; height: 15px; }

    .doc-thumb {
      width: 46px; height: 30px; border-radius: 6px; overflow: hidden; cursor: pointer;
      border: 1.5px dashed var(--color-border-bright);
      display: flex; align-items: center; justify-content: center; color: var(--color-text-faint);
      transition: all 0.15s var(--ease);
    }
    .doc-thumb:hover { border-color: var(--color-primary); color: var(--color-primary-bright); }
    .doc-thumb.has-doc { border-style: solid; border-color: var(--color-border); }
    .doc-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .doc-thumb svg { width: 16px; height: 16px; }

    .modal { max-width: 600px; padding: 30px; max-height: 90vh; overflow-y: auto; overflow-x: hidden; }
    .modal h3 { font-size: 19px; font-weight: 800; margin-bottom: 6px; }
    .modal .muted { margin-bottom: 20px; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }

    .doc-modal { max-width: 560px; }
    .instructions {
      display: flex; gap: 12px; padding: 14px 16px; border-radius: var(--radius-sm);
      background: var(--color-danger-bg); border: 1px solid rgba(255,77,94,0.25); margin-bottom: 22px;
    }
    .instructions svg { width: 20px; height: 20px; color: var(--color-primary-bright); flex-shrink: 0; margin-top: 1px; }
    .instructions strong { font-size: 13px; display: block; margin-bottom: 4px; }
    .instructions p { font-size: 13px; color: var(--color-text-muted); line-height: 1.5; }

    /* Moldura "deitada" (formato de documento tipo RG/CNH, aspect-ratio ~1.586 = cartão ISO) */
    .doc-frame {
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
      width: 100%; aspect-ratio: 1.586 / 1; max-width: 420px; margin: 0 auto;
      border: 2px dashed var(--color-border-bright); border-radius: var(--radius);
      cursor: pointer; position: relative; overflow: hidden;
      color: var(--color-text-muted); text-align: center; padding: 20px;
      transition: all 0.2s var(--ease);
      background: var(--color-bg-elevated);
    }
    .doc-frame:hover { border-color: var(--color-primary); background: var(--color-primary-glow); }
    .doc-frame.filled { border-style: solid; padding: 0; }
    .doc-frame.uploading { opacity: 0.6; pointer-events: none; }
    .doc-frame img { width: 100%; height: 100%; object-fit: cover; }
    .doc-frame svg { width: 30px; height: 30px; color: var(--color-primary-bright); }
    .doc-frame span { font-size: 14px; font-weight: 700; color: var(--color-text); }
    .doc-frame small { font-size: 11.5px; }
    .frame-corner { position: absolute; width: 18px; height: 18px; border-color: var(--color-primary-bright); pointer-events: none; opacity: 0.7; }
    .frame-corner.tl { top: 8px; left: 8px; border-top: 2px solid; border-left: 2px solid; border-radius: 4px 0 0 0; }
    .frame-corner.tr { top: 8px; right: 8px; border-top: 2px solid; border-right: 2px solid; border-radius: 0 4px 0 0; }
    .frame-corner.bl { bottom: 8px; left: 8px; border-bottom: 2px solid; border-left: 2px solid; border-radius: 0 0 0 4px; }
    .frame-corner.br { bottom: 8px; right: 8px; border-bottom: 2px solid; border-right: 2px solid; border-radius: 0 0 4px 0; }
    .doc-frame.filled .frame-corner { display: none; }

    .troca-btn { display: flex; margin: 16px auto 0; }
  `],
  animations: [backdropFade, modalSpring]
})
export class ClientesListComponent implements OnInit {
  maskDocumento = maskDocumento;

  clientes: Cliente[] = [];
  busca = '';
  modalAberto = false;
  editandoId: string | null = null;
  form: ClienteRequest = { ...CLIENTE_VAZIO };
  erro = '';
  salvando = false;
  private buscaTimeout: any;

  modalDocumentoAberto = false;
  clienteSelecionado: Cliente | null = null;
  enviandoDocumento = false;

  get previewUrl(): string | undefined {
    return this.clienteSelecionado?.documentoImagemUrl;
  }

  constructor(private service: ClientesService, private dialog: DialogService) {}

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
      nome: c.nome, documentoTipo: c.documentoTipo, documento: maskDocumento(c.documento, c.documentoTipo),
      email: c.email, telefone: c.telefone, endereco: c.endereco,
      cnh: c.cnh, validadeCNH: c.validadeCNH?.substring(0, 10)
    };
    this.erro = '';
    this.modalAberto = true;
  }

  onDocumentoChange(valor: string): void {
    this.form.documento = maskDocumento(valor, this.form.documentoTipo as 'CPF' | 'CNPJ');
  }

  onTelefoneChange(valor: string): void {
    this.form.telefone = maskTelefone(valor);
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
      error: (err) => {
        this.salvando = false;
        this.erro = err.error?.erro ?? 'Não foi possível salvar.';
      }
    });
  }

  async remover(c: Cliente): Promise<void> {
    const ok = await this.dialog.confirm(`Excluir o cliente ${c.nome}? Essa ação não pode ser desfeita.`, { title: 'Excluir cliente' });
    if (!ok) return;
    this.service.remover(c.id).subscribe({
      next: () => this.carregar(),
      error: async (err) => this.dialog.alert(err.error?.erro ?? 'Não foi possível excluir o cliente.', { tone: 'danger' })
    });
  }

  abrirDocumento(c: Cliente): void {
    this.clienteSelecionado = c;
    this.modalDocumentoAberto = true;
  }

  fecharDocumento(): void {
    this.modalDocumentoAberto = false;
    this.clienteSelecionado = null;
    this.carregar();
  }

  enviarDocumento(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo || !this.clienteSelecionado) return;

    this.enviandoDocumento = true;
    this.service.enviarDocumento(this.clienteSelecionado.id, arquivo).subscribe({
      next: (atualizado) => {
        this.clienteSelecionado = atualizado;
        this.enviandoDocumento = false;
        input.value = '';
      },
      error: (err) => {
        this.enviandoDocumento = false;
        this.dialog.alert(err.error?.erro ?? 'Não foi possível enviar o documento.', { tone: 'danger' });
      }
    });
  }
}
