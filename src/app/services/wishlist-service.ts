import { Injectable, Signal, computed, signal } from '@angular/core';
import { AuthService } from './auth-service';
import { IMovie } from '../models/i-movie';

export interface WishlistItem {
	id: number;
	title: string;
	poster_path: string;
	release_date: string;
	vote_average: number;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
	private readonly storagePrefix = 'wishlist_';
	private itemsSignal = signal<WishlistItem[]>([]);

	readonly items: Signal<WishlistItem[]> = this.itemsSignal.asReadonly();
	readonly count: Signal<number> = computed(() => this.itemsSignal().length);

	constructor(private auth: AuthService) {
		this.load();
	}

	private getStorageKey(): string | null {
		const email = this.auth.getCurrentUserEmail();
		return email ? `${this.storagePrefix}${email.toLowerCase()}` : null;
	}

	private load(): void {
		const key = this.getStorageKey();
		if (!key) {
			this.itemsSignal.set([]);
			return;
		}
		try {
			const raw = localStorage.getItem(key);
			this.itemsSignal.set(raw ? (JSON.parse(raw) as WishlistItem[]) : []);
		} catch {
			this.itemsSignal.set([]);
		}
	}

	private persist(): void {
		const key = this.getStorageKey();
		if (!key) return;
		localStorage.setItem(key, JSON.stringify(this.itemsSignal()));
	}

	// Should be called after a login/logout to switch user context
	refreshForCurrentUser(): void {
		this.load();
	}

	addMovie(movie: IMovie): void {
		const current = this.itemsSignal();
		if (current.some(i => i.id === movie.id)) return;
		const item: WishlistItem = {
			id: movie.id,
			title: movie.title,
			poster_path: movie.poster_path,
			release_date: movie.release_date,
			vote_average: movie.vote_average,
		};
		this.itemsSignal.set([item, ...current]);
		this.persist();
	}

	removeMovie(id: number): void {
		this.itemsSignal.set(this.itemsSignal().filter(i => i.id !== id));
		this.persist();
	}
}


