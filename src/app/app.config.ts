import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router'; // <-- 1. استيراد الدالة الجديدة

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // 2. إضافة الخاصية الجديدة هنا
    provideRouter(
      routes, 
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // للانتقال لأعلى الصفحة دائماً
      })
    ),
    
    provideHttpClient(),
  ]
};