import { Injectable } from '@angular/core';

interface StoredUser {
	email: string;
	password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly usersKey = 'auth_users';
	private readonly currentKey = 'auth_current_email';

	register(email: string, password: string): void {
		const users = this.readUsers();
		const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
		if (exists) {
			throw new Error('Email already registered');
		}
		users.push({ email, password });
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
}


