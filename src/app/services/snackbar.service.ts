import { Injectable, signal } from '@angular/core';

export interface SnackbarMessage {
  id: number;
  text: string;
  duration?: number;
  type?: 'info' | 'success' | 'error';
  polite?: 'polite' | 'assertive';
}

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private _messages = signal<SnackbarMessage[]>([]);

  messages = () => this._messages();

  open(text: string, duration = 3000, opts?: { type?: 'info' | 'success' | 'error'; polite?: 'polite' | 'assertive' }) {
    const msg: SnackbarMessage = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      text,
      duration,
      type: opts?.type ?? 'info',
      polite: opts?.polite ?? (opts?.type === 'error' ? 'assertive' : 'polite')
    };
    this._messages.set([...this._messages(), msg]);
    if (duration && duration > 0) {
      setTimeout(() => this.close(msg.id), duration);
    }
  }

  success(text: string, duration = 3000) {
    this.open(text, duration, { type: 'success', polite: 'polite' });
  }

  error(text: string, duration = 4000) {
    this.open(text, duration, { type: 'error', polite: 'assertive' });
  }

  info(text: string, duration = 3000) {
    this.open(text, duration, { type: 'info', polite: 'polite' });
  }

  close(id: number) {
    this._messages.set(this._messages().filter(m => m.id !== id));
  }
}
