import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { EMPTY } from 'rxjs';
import { User, FakeStoreUser, fakeStoreUserToUser, userToFakeStoreUser } from './user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersUrl = 'https://fakestoreapi.com/users';
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  private readonly http = inject(HttpClient);

  loadUsers() {
    // Skip API call if users are already loaded
    if (this.users().length > 0) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<FakeStoreUser[]>(this.usersUrl)
      .pipe(
        tap(fakeUsers => {
          const users = fakeUsers.map(fakeStoreUserToUser);
          this.users.set(users);
        }),
        catchError(() => {
          this.error.set('Failed to load users');
          this.loading.set(false);
          return of([]);
        })
      )
      .subscribe({
        complete: () => this.loading.set(false),
      });
  }

  addUser(user: User) {
    const fakeUser = {
      username: user.email.split('@')[0],
      password: 'password123',
      email: user.email,
      name: {
        firstname: user.firstName,
        lastname: user.lastName,
      },
      phone: user.phoneNumber,
    };

    this.http
      .post<FakeStoreUser>(this.usersUrl, fakeUser)
      .pipe(
        tap(fakeUser => {
          const newUser: User = {
            ...fakeStoreUserToUser(fakeUser),
            ...user,
          };
          const current = this.users();
          this.users.set([...current, newUser]);
        }),
        catchError(() => {
          this.error.set('Failed to add user');
          return EMPTY;
        })
      )
      .subscribe();
  }

  updateUser(user: User) {
    const fakePayload = userToFakeStoreUser(user);

    this.http
      .patch<FakeStoreUser>(`${this.usersUrl}/${user.id}`, fakePayload)
      .pipe(
        tap(() => {
          const current = this.users();
          const index = current.findIndex(u => u.id === user.id);
          if (index !== -1) {
            const updated = [...current];
            updated[index] = user;
            this.users.set(updated);
          }
        }),
        catchError(() => {
          this.error.set('Failed to update user');
          return EMPTY;
        })
      )
      .subscribe();
  }

  deleteUser(id: number) {
    this.http
      .delete(`${this.usersUrl}/${id}`)
      .pipe(
        tap(() => {
          const current = this.users();
          this.users.set(current.filter(u => u.id !== id));
        }),
        catchError(() => {
          this.error.set('Failed to delete user');
          return EMPTY;
        })
      )
      .subscribe();
  }

  deleteUsers(ids: number[]) {
    // Fake Store API doesn't support batch delete, so delete one by one
    let remaining = [...ids];

    const deleteNext = () => {
      if (remaining.length === 0) {
        // Clean up local state after all deletes complete
        const current = this.users();
        this.users.set(current.filter(u => !ids.includes(u.id)));
        return;
      }

      const id = remaining.shift()!;
      this.http.delete(`${this.usersUrl}/${id}`).subscribe({
        error: () => {
          this.error.set(`Failed to delete user ${id}`);
          deleteNext();
        },
        next: () => {
          deleteNext();
        },
      });
    };

    deleteNext();
  }
}
