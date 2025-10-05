import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, NgIf],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  email = '';
  password = '';
  message: string | null = null;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

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

}
