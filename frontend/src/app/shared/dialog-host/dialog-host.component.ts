import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../core/services/dialog.service';
import { backdropFade, modalSpring } from '../../core/animations/fluid.animations';

@Component({
  selector: 'app-dialog-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="dialog.state() as d" (click)="onBackdropClick()" @backdropFade>
      <div class="modal card dialog-modal" (click)="$event.stopPropagation()" @modalSpring>
        <div class="dialog-icon" [ngClass]="'tone-' + d.config.tone">
          <svg *ngIf="d.config.tone === 'danger'" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a1.5 1.5 0 0 0 1.3 2.25h17.76a1.5 1.5 0 0 0 1.3-2.25L13.7 3.86a1.5 1.5 0 0 0-2.6 0Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg *ngIf="d.config.tone === 'success'" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m8.5 12.5 2.5 2.5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg *ngIf="d.config.tone === 'info'" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </div>

        <h3>{{ d.config.title }}</h3>
        <p>{{ d.config.message }}</p>

        <div class="dialog-actions">
          <button class="btn btn-secondary" *ngIf="d.config.cancelText" (click)="dialog.respond(false)">{{ d.config.cancelText }}</button>
          <button class="btn" [ngClass]="d.config.tone === 'danger' ? 'btn-danger' : 'btn-primary'" (click)="dialog.respond(true)">{{ d.config.confirmText }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-modal { max-width: 400px; padding: 30px; text-align: center; }
    .dialog-icon {
      width: 54px; height: 54px; border-radius: 50%; margin: 0 auto 18px;
      display: flex; align-items: center; justify-content: center;
    }
    .dialog-icon svg { width: 26px; height: 26px; }
    .dialog-icon.tone-danger { background: var(--color-danger-bg); color: var(--color-danger); box-shadow: 0 0 0 1px rgba(255,77,94,0.25); }
    .dialog-icon.tone-success { background: var(--color-success-bg); color: var(--color-success); box-shadow: 0 0 0 1px rgba(16,214,138,0.25); }
    .dialog-icon.tone-info { background: var(--color-primary-glow); color: var(--color-primary-bright); box-shadow: 0 0 0 1px rgba(239,35,60,0.25); }
    h3 { font-size: 17px; font-weight: 800; margin-bottom: 8px; }
    p { font-size: 13.5px; color: var(--color-text-muted); line-height: 1.55; }
    .dialog-actions { display: flex; justify-content: center; gap: 10px; margin-top: 24px; }
    .dialog-actions .btn { flex: 1; justify-content: center; }
  `],
  animations: [backdropFade, modalSpring]
})
export class DialogHostComponent {
  constructor(public dialog: DialogService) {}

  onBackdropClick(): void {
    const atual = this.dialog.state();
    if (!atual) return;
    // Se não tem botão de cancelar, é um alert: clicar fora só reconhece.
    // Se tem, clicar fora equivale a cancelar.
    this.dialog.respond(!atual.config.cancelText);
  }
}
