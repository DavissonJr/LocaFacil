import { Injectable, signal } from '@angular/core';

export type DialogTone = 'danger' | 'info' | 'success';

export interface DialogConfig {
  title: string;
  message: string;
  tone: DialogTone;
  confirmText: string;
  cancelText?: string; // se ausente, é um "alert" (só um botão)
}

interface DialogState {
  config: DialogConfig;
  resolve: (value: boolean) => void;
}

/**
 * Substitui window.alert/confirm por um modal no visual do app.
 * Uso: await this.dialog.confirm('Tem certeza?'); / await this.dialog.alert('Feito!');
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  state = signal<DialogState | null>(null);

  confirm(message: string, opts?: Partial<Omit<DialogConfig, 'message'>>): Promise<boolean> {
    return new Promise(resolve => {
      this.state.set({
        config: {
          title: opts?.title ?? 'Confirmar ação',
          message,
          tone: opts?.tone ?? 'danger',
          confirmText: opts?.confirmText ?? 'Confirmar',
          cancelText: opts?.cancelText ?? 'Cancelar'
        },
        resolve
      });
    });
  }

  alert(message: string, opts?: Partial<Omit<DialogConfig, 'message' | 'cancelText'>>): Promise<void> {
    return new Promise(resolve => {
      this.state.set({
        config: {
          title: opts?.title ?? (opts?.tone === 'danger' ? 'Ops' : 'Aviso'),
          message,
          tone: opts?.tone ?? 'info',
          confirmText: opts?.confirmText ?? 'Entendi'
        },
        resolve: () => resolve()
      });
    });
  }

  respond(value: boolean): void {
    const atual = this.state();
    if (!atual) return;
    this.state.set(null);
    atual.resolve(value);
  }
}
