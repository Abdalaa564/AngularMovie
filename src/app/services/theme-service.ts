import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDark = false;

  initTheme(): void {
    const saved = localStorage.getItem('theme') || 'light';
    this.isDark = saved === 'dark';
    this.applyTheme();
  }


  toggleTheme(): void {
    this.isDark = !this.isDark;
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  get currentTheme(): 'dark' | 'light' {
    return this.isDark ? 'dark' : 'light';
  }

  private applyTheme(): void {
  if (this.isDark) {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }

  }

}
