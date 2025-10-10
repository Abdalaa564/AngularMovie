import { Component, OnInit, signal } from '@angular/core'; 
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { LoadingSpinner } from '../../../loading-spinner/loading-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, NgIf, LoadingSpinner],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
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
    if (!this.name || !this.email || !this.password) {
      this.error = 'Please enter your name, email and password.';
      this.message = null;
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      this.message = null;
      return;
    }
    try {
      this.auth.register(this.name, this.email, this.password);
      this.error = null;
      this.message = 'Account created and signed in successfully.';
      setTimeout(() => this.router.navigateByUrl('/'), 800);
    } catch (e: any) {
      this.message = null;
      this.error = e?.message || 'Registration failed, please try again.';
    }
  }

    logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
  
}