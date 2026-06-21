import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs';

export interface User {
  username: string;
  isAdmin: boolean;
}

export interface CustomerCredentials {
  username: string;
  password: string;
}

export interface FakeStoreAuthUser {
  id: number;
  email: string;
  username: string;
  password: string;
  name: {
    firstname: string;
    lastname: string;
  };
  phone: string;
  address?: {
    geolocation: { lat: string; long: string };
    city: string;
    street: string;
    number: number;
    zipcode: string;
  };
  __v?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'angular_auth_user';
  private readonly CUSTOMERS_KEY = 'angular_customers';
  private readonly FAKESTORE_AUTH_URL = 'https://fakestoreapi.com/auth';
  private readonly FAKESTORE_USERS_URL = 'https://fakestoreapi.com/users';
  private readonly http = inject(HttpClient);

  isAuthenticated = signal<boolean>(this.hasStoredUser());
  user = signal<User | null>(this.getStoredUser());

  get authState(): Observable<User | null> {
    return of(this.getStoredUser());
  }

  login(username: string, password: string): Observable<boolean> {
    // Admin authentication (kept as local fallback)
    if (username === 'admin' && password === 'password') {
      const user: User = { username, isAdmin: true };
      this.setAuth(user);
      return of(true);
    }

    // First try Fake Store API auth endpoint
    return this.http
      .post<{ accessToken: string; userId: number }>(`${this.FAKESTORE_AUTH_URL}/login`, {
        username,
        password,
      })
      .pipe(
        map(() => {
          const user: User = { username, isAdmin: false };
          this.setAuth(user);
          return true;
        }),
        catchError(() => {
          // Fall back to local customer auth
          return this.tryLocalLogin(username, password);
        })
      );
  }

  register(username: string, password: string): Observable<boolean> {
    if (!username || !password) {
      return of(false);
    }

    // Check if username already exists (as customer or admin)
    if (username === 'admin') {
      return of(false);
    }

    // Try Fake Store API registration
    return this.http
      .post<FakeStoreAuthUser>(`${this.FAKESTORE_AUTH_URL}/register`, {
        username,
        password,
        email: `${username}@fakestore.local`,
        name: {
          firstname: username,
          lastname: 'user',
        },
        phone: '000-000-0000',
      })
      .pipe(
        map(() => {
          // Also save locally for fallback
          const customers = this.getStoredCustomers();
          customers.push({ username, password });
          this.saveCustomers(customers);

          // Auto-login after registration
          const user: User = { username, isAdmin: false };
          this.setAuth(user);
          return true;
        }),
        catchError(() => {
          // Fall back to local registration
          return this.tryLocalRegister(username, password);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.isAuthenticated.set(false);
    this.user.set(null);
  }

  private tryLocalLogin(username: string, password: string): Observable<boolean> {
    const customer = this.findCustomer(username, password);
    if (customer) {
      const user: User = { username: customer.username, isAdmin: false };
      this.setAuth(user);
      return of(true);
    }

    return of(false);
  }

  private tryLocalRegister(username: string, password: string): Observable<boolean> {
    const existing = this.getStoredCustomers().find(c => c.username === username);
    if (existing) {
      return of(false);
    }

    const customers = this.getStoredCustomers();
    customers.push({ username, password });
    this.saveCustomers(customers);

    // Auto-login after registration
    const user: User = { username, isAdmin: false };
    this.setAuth(user);
    return of(true);
  }

  private hasStoredUser(): boolean {
    try {
      return !!localStorage.getItem(this.STORAGE_KEY);
    } catch {
      return false;
    }
  }

  private getStoredUser(): User | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private setAuth(user: User): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    } catch {
      /* quota exceeded */
    }
    this.isAuthenticated.set(true);
    this.user.set(user);
  }

  private getStoredCustomers(): CustomerCredentials[] {
    try {
      const data = localStorage.getItem(this.CUSTOMERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveCustomers(customers: CustomerCredentials[]): void {
    try {
      localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(customers));
    } catch {
      /* quota exceeded */
    }
  }

  private findCustomer(username: string, password: string): CustomerCredentials | undefined {
    return this.getStoredCustomers().find(c => c.username === username && c.password === password);
  }
}
