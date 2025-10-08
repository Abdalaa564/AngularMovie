// scroll-service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  showBackToTop = signal(false);

  constructor() {
    this.initScrollListener();
  }

  private initScrollListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  private handleScroll(): void {
    const scrollY = window.scrollY;
    this.showBackToTop.set(scrollY > 500);
  }


  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  scrollToElement(elementId: string, offset: number = 0): void {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  }
}