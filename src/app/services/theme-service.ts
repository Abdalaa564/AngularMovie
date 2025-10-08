import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDark = false;

  initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    this.isDark = saved === 'dark';
    this.applyTheme();
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  get currentTheme(): 'dark' | 'light' {
    return this.isDark ? 'dark' : 'light';
  }

  private applyTheme() {
    document.body.classList.toggle('dark-mode', this.isDark);
  }

}
