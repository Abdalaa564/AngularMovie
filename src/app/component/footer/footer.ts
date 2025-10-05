import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  constructor(private router: Router) {}

  isAuthPage(): boolean {
    const url = this.router.url;
    return url.startsWith('/auth/login') || url.startsWith('/auth/register') || url.startsWith('/Wishlist');
  }
}
