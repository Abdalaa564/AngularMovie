import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  showAllDropdown = false;
 showImdbPro = false;
   hideProBox() {
  setTimeout(() => {
    this.showImdbPro = false;
  }, 200); // تأخير 200ms
}


}
