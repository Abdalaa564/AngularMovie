import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, NgIf],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {

  email = '';
  password = '';
  confirmPassword = '';
  message: string | null = null;
  error: string | null = null;
  
  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'برجاء إدخال البريد وكلمة المرور';
      this.message = null;
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'كلمتا المرور غير متطابقتين';
      this.message = null;
      return;
    }
    try {
      this.auth.register(this.email, this.password);
      this.error = null;
      this.message = 'تم إنشاء الحساب وتسجيل الدخول بنجاح';
      // الانتقال للصفحة الرئيسية بعد ثانية
      setTimeout(() => this.router.navigateByUrl('/'), 800);
    } catch (e: any) {
      this.message = null;
      this.error = e?.message || 'فشل التسجيل، حاول مرة أخرى';
    }
  }

}
