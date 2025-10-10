// back-to-top.component.ts
import { Component, inject } from '@angular/core';
import { ScrollService } from '../services/scroll-service';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  template: `
    <button class="back-to-top-btn" 
            (click)="scrollToTop()" 
            [class.show]="showBackToTop()"
            title="Back to Top">
      <i class="bi bi-chevron-up"></i>
    </button>
  `,
  styles: [`
    .back-to-top-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #ffc107;
      color: #212529;
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      font-size: 1.2rem;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      z-index: 1000;
      transition: all 0.3s ease;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .back-to-top-btn.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .back-to-top-btn:hover {
      background-color: #e0a800;
      transform: translateY(-2px);
    }
  `]
})
export class BackToTop {
  private scrollService = inject(ScrollService);
  showBackToTop = this.scrollService.showBackToTop;

  scrollToTop(): void {
    this.scrollService.scrollToTop();
  }
}