import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="snackbar-container">
      <div class="snackbar" *ngFor="let m of svc.messages()" [class.type-success]="m.type === 'success'" [class.type-error]="m.type === 'error'">
        <div class="snackbar-text">{{ m.text }}</div>
        <button class="snackbar-close" (click)="svc.close(m.id)" aria-label="Close notification">×</button>
      </div>
    </div>

    <div [attr.aria-live]="latestPoliteness" class="visually-hidden" aria-atomic="true">{{ latestMessage }}</div>
  `,
  styles: [
    `:host { position: fixed; inset: auto 16px 16px auto; z-index: 1100; }`,
    `.snackbar-container { display:flex; flex-direction:column; gap:8px; align-items:flex-end; }`,
    `.snackbar { background:#222; color:#fff; padding:10px 14px; border-radius:6px; display:flex; align-items:center; gap:8px; box-shadow:0 6px 18px rgba(0,0,0,0.2); }`,
    `.snackbar.type-success { background: #0f9d58; }`,
    `.snackbar.type-error { background: #d23f31; }`,
    `.snackbar-text { max-width:380px; }`,
    `.snackbar-close { background:transparent; border:none; color:#fff; font-size:18px; cursor:pointer; }`,
    `.visually-hidden { position: absolute !important; height: 1px; width: 1px; overflow: hidden; clip: rect(1px, 1px, 1px, 1px); white-space: nowrap; }
    `
  ]
})
export class AppSnackbar {
  svc = inject(SnackbarService);

  get latestMessage(): string {
    const msgs = this.svc.messages();
    return msgs.length ? msgs[msgs.length - 1].text : '';
  }

  get latestPoliteness(): 'polite' | 'assertive' {
    const msgs = this.svc.messages();
    return msgs.length ? (msgs[msgs.length - 1].polite ?? 'polite') : 'polite';
  }
}
