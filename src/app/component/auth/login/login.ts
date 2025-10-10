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
      this.error = 'Please enter your email and password.';
      this.message = null;
      return;
    }
    const ok = this.auth.login(this.email, this.password);
    if (ok) {
      this.error = null;
      this.message = 'Signed in successfully.';
      setTimeout(() => this.router.navigateByUrl('/'), 800);
    } else {
      this.message = null;
      this.error = 'Invalid credentials, please try again.';
    }
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  signInWithGoogle() {
  this.auth.signInWithGoogle()
    .then(() => {
      this.error = null;
      this.message = 'Signed in successfully with Google.';
      setTimeout(() => this.router.navigateByUrl('/'), 800);
    })
    .catch((err: any) => {
      this.message = null;
      this.error = 'Google sign-in failed: ' + err.message;
    });
}

}