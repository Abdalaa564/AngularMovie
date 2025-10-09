import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { LoadingSpinner } from '../../../loading-spinner/loading-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, NgIf, RouterLink, LoadingSpinner],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {

  email = '';
  password = '';
  message: string | null = null;
  error: string | null = null;

  isPageLoading = signal(true);

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isPageLoading.set(false);
    }, 700);
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'برجاء إدخال البريد وكلمة المرور';
      this.message = null;
      return;
    }
    const ok = this.auth.login(this.email, this.password);
    if (ok) {
      this.error = null;
      this.message = 'تم تسجيل الدخول بنجاح';
      setTimeout(() => this.router.navigateByUrl('/'), 800);
    } else {
      this.message = null;
      this.error = 'بيانات غير صحيحة، حاول مرة أخرى';
    }
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }
}