import { Injectable } from '@angular/core';

interface StoredUser {
	name: string;
	email: string;
	password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly usersKey = 'auth_users';
	private readonly currentKey = 'auth_current_email';

	register(name: string, email: string, password: string): void {
		const users = this.readUsers();
		const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
		if (exists) {
			throw new Error('Email already registered');
		}
		users.push({ name, email, password });
		this.writeUsers(users);
		// Auto-login after register (optional)
		localStorage.setItem(this.currentKey, email);
	}

	login(email: string, password: string): boolean {
		const users = this.readUsers();
		const match = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
		if (match) {
			localStorage.setItem(this.currentKey, match.email);
			return true;
		}
		return false;
	}

	logout(): void {
		localStorage.removeItem(this.currentKey);
	}

	isLoggedIn(): boolean {
		return !!localStorage.getItem(this.currentKey);
	}

	getCurrentUserEmail(): string | null {
		return localStorage.getItem(this.currentKey);
	}

	private readUsers(): StoredUser[] {
		try {
			const raw = localStorage.getItem(this.usersKey);
			return raw ? (JSON.parse(raw) as StoredUser[]) : [];
		} catch {
			return [];
		}
	}

	private writeUsers(users: StoredUser[]): void {
		localStorage.setItem(this.usersKey, JSON.stringify(users));
	}

	  async signInWithGoogle(): Promise<void> {
    try {
      const googleAuth = window.open(
        'https://accounts.google.com/signin',
        '_blank',
        'width=500,height=600'
      );

      if (!googleAuth) {
        throw new Error('Failed to open the sign-in window.');
      }

      await new Promise(resolve => setTimeout(resolve, 1500)); 

      const fakeGoogleUser = {
		name: 'Google User',
        email: 'google_user@example.com',
        password: 'google-auth'
      };
	  
      localStorage.setItem(this.currentKey, fakeGoogleUser.email);

      const users = this.readUsers();
      const exists = users.some(u => u.email === fakeGoogleUser.email);
      if (!exists) {
        users.push(fakeGoogleUser);
        this.writeUsers(users);
      }
    } catch (err) {
      throw err;
    }
  }
}


