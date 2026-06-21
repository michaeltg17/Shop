import { TestBed } from '@angular/core/testing';
import { AuthService, User } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

const fakestoreAuthUrl = 'https://fakestoreapi.com/auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for isAuthenticated when no user is stored', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should return null for user when no user is stored', () => {
    expect(service.user()).toBeNull();
  });

  it('should login with valid admin credentials', () => {
    service.login('admin', 'password').subscribe(success => {
      expect(success).toBe(true);
    });
    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.username).toBe('admin');
    expect(service.user()?.isAdmin).toBe(true);
  });

  it('should return false for invalid admin credentials (falls back to local then FSA 401)', done => {
    service.login('wrong', 'wrong').subscribe(success => {
      expect(success).toBe(false);
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
    req.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
  });

  it('should clear auth state on logout', () => {
    service.login('admin', 'password').subscribe(() => undefined);
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('should persist auth across storage reads', () => {
    service.login('admin', 'password').subscribe(() => undefined);
    expect(localStorage.getItem('angular_auth_user')).toBeTruthy();
  });

  it('should return Observable<User | null> from authState', () => {
    service.login('admin', 'password').subscribe(() => undefined);
    let emitted: User | null = null;
    service.authState.subscribe(user => {
      emitted = user;
    });
    expect(emitted?.username).toBe('admin');
  });

  it('should handle localStorage errors gracefully in hasStoredUser', () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = jest.fn(() => {
      throw new Error('QuotaExceededError');
    });
    const service2 = TestBed.inject(AuthService);
    expect(service2.isAuthenticated()).toBe(false);
    localStorage.getItem = originalGetItem;
  });

  it('should handle localStorage errors gracefully in getStoredUser', () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = jest.fn(() => {
      throw new Error('QuotaExceededError');
    });
    const service2 = TestBed.inject(AuthService);
    expect(service2.user()).toBeNull();
    localStorage.getItem = originalGetItem;
  });

  it('should register a new customer (FSA fails, falls back to local)', done => {
    service.register('customer1', 'pass123').subscribe(success => {
      expect(success).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.user()?.username).toBe('customer1');
      expect(service.user()?.isAdmin).toBe(false);
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should return false when registering with empty username', () => {
    service.register('', 'pass123').subscribe(success => {
      expect(success).toBe(false);
    });
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should return false when registering with empty password', () => {
    service.register('customer1', '').subscribe(success => {
      expect(success).toBe(false);
    });
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should return false when registering username "admin"', () => {
    service.register('admin', 'pass123').subscribe(success => {
      expect(success).toBe(false);
    });
  });

  it('should return false when registering duplicate username', done => {
    service.register('customer1', 'pass123').subscribe(() => {
      service.logout();
      service.register('customer1', 'different').subscribe(success => {
        expect(success).toBe(false);
        done();
      });
      const req2 = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
      req2.flush('Username already exists', { status: 409, statusText: 'Conflict' });
    });
    const req1 = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req1.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should login a registered customer (FSA fails, falls back to local)', done => {
    service.register('customer1', 'pass123').subscribe(() => {
      service.logout();
      service.login('customer1', 'pass123').subscribe(success => {
        expect(success).toBe(true);
        expect(service.isAuthenticated()).toBe(true);
        expect(service.user()?.username).toBe('customer1');
        expect(service.user()?.isAdmin).toBe(false);
        done();
      });
      const req2 = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
      req2.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
    });
    const req1 = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req1.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should return false for unregistered customer login', done => {
    service.login('nonexistent', 'pass123').subscribe(success => {
      expect(success).toBe(false);
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
    req.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
  });

  it('should return false for wrong password on registered customer', done => {
    service.register('customer1', 'pass123').subscribe(() => {
      service.logout();
      service.login('customer1', 'wrongpass').subscribe(success => {
        expect(success).toBe(false);
        done();
      });
      const req2 = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
      req2.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
    });
    const req1 = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req1.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should auto-login after registration (FSA fails → local)', done => {
    service.register('customer1', 'pass123').subscribe(success => {
      expect(success).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.user()?.username).toBe('customer1');
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should persist customers across storage reads', done => {
    service.register('customer1', 'pass123').subscribe(() => {
      service.logout();
      const newService = TestBed.inject(AuthService);
      newService.login('customer1', 'pass123').subscribe(success => {
        expect(success).toBe(true);
        expect(newService.isAuthenticated()).toBe(true);
        done();
      });
      const req2 = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
      req2.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
    });
    const req1 = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req1.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should handle localStorage errors gracefully when getting customers', done => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = jest.fn(() => {
      throw new Error('QuotaExceededError');
    });
    const service2 = TestBed.inject(AuthService);
    service2.login('someuser', 'somepass').subscribe(success => {
      expect(success).toBe(false);
      localStorage.getItem = originalGetItem;
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
    req.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
  });

  it('should return false for admin login with wrong password', done => {
    service.login('admin', 'wrongpass').subscribe(success => {
      expect(success).toBe(false);
      done();
    });
    // Admin check fails (wrong password) → tries FSA → falls back → false
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
    req.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
  });

  it('should return false for admin login with wrong username', done => {
    service.login('wrongadmin', 'password').subscribe(success => {
      expect(success).toBe(false);
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
    req.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
  });

  it('should return false for empty credentials', done => {
    service.login('', '').subscribe(success => {
      expect(success).toBe(false);
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
    req.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle malformed JSON in localStorage for customers', done => {
    localStorage.setItem('angular_customers', 'not-json');
    const service2 = TestBed.inject(AuthService);
    service2.login('test', 'test').subscribe(success => {
      expect(success).toBe(false);
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
    req.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle malformed JSON in localStorage for auth', () => {
    localStorage.setItem('angular_auth_user', 'not-json');
    const service2 = TestBed.inject(AuthService);
    expect(service2.user()).toBeNull();
  });

  it('should handle malformed JSON in localStorage for customers (register)', done => {
    localStorage.setItem('angular_customers', 'not-json');
    const service2 = TestBed.inject(AuthService);
    service2.register('malformed-test', 'test123').subscribe(success => {
      // FSA fails → local fallback: getStoredCustomers() returns [] (catches parse error)
      // → no existing customer found → registration succeeds locally
      expect(success).toBe(true);
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should login a registered customer after logout and re-login', done => {
    service.register('relogin', 'pw').subscribe(() => {
      service.logout();
      service.login('relogin', 'pw').subscribe(success => {
        expect(success).toBe(true);
        expect(service.user()?.username).toBe('relogin');
        expect(service.user()?.isAdmin).toBe(false);
        done();
      });
      const req2 = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
      req2.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
    });
    const req1 = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req1.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should return false when trying to login a registered customer with wrong password', done => {
    service.register('pw-check', 'correct').subscribe(() => {
      service.logout();
      service.login('pw-check', 'wrong').subscribe(success => {
        expect(success).toBe(false);
        done();
      });
      const req2 = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
      req2.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
    });
    const req1 = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req1.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should set auth correctly after admin login and clear on logout', () => {
    service.login('admin', 'password').subscribe(() => undefined);
    expect(service.user()?.isAdmin).toBe(true);
    service.logout();
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('angular_auth_user')).toBeNull();
  });

  it('should set auth correctly after customer registration and clear on logout', done => {
    service.register('logout-test', 'pw').subscribe(() => {
      expect(service.user()?.isAdmin).toBe(false);
      service.logout();
      expect(service.user()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should register multiple customers and login with each', done => {
    service.register('user1', 'pass1').subscribe(() => {
      service.logout();
      service.register('user2', 'pass2').subscribe(() => {
        service.logout();
        service.login('user1', 'pass1').subscribe(success => {
          expect(success).toBe(true);
          expect(service.user()?.username).toBe('user1');
          service.logout();
          service.login('user2', 'pass2').subscribe(success2 => {
            expect(success2).toBe(true);
            expect(service.user()?.username).toBe('user2');
            done();
          });
          const req3 = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
          req3.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
        });
        const req2 = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
        req2.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
      });
      const req1b = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
      req1b.flush('Username already exists', { status: 409, statusText: 'Conflict' });
    });
    const req1a = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req1a.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should handle localStorage setItem errors during registration gracefully', done => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    service.register('quota-user', 'pass').subscribe(success => {
      // Auth state should still be set in memory even if localStorage fails
      expect(success).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.user()?.username).toBe('quota-user');
      localStorage.setItem = originalSetItem;
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should handle localStorage setItem errors during login gracefully', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    service.login('admin', 'password').subscribe(success => {
      expect(success).toBe(true);
    });
    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.username).toBe('admin');
    localStorage.setItem = originalSetItem;
  });

  it('should set localStorage correctly during admin login', () => {
    service.login('admin', 'password').subscribe(() => undefined);
    const stored = localStorage.getItem('angular_auth_user');
    expect(stored).toBe(JSON.stringify({ username: 'admin', isAdmin: true }));
  });

  it('should set localStorage correctly during customer registration', done => {
    service.register('testuser', 'testpass').subscribe(() => {
      const stored = localStorage.getItem('angular_auth_user');
      expect(stored).toBe(JSON.stringify({ username: 'testuser', isAdmin: false }));
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should save customers to localStorage during registration', done => {
    service.register('testuser', 'testpass').subscribe(() => {
      const stored = localStorage.getItem('angular_customers');
      const customers = JSON.parse(stored!);
      expect(customers).toContainEqual({ username: 'testuser', password: 'testpass' });
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should not modify customer list when registration fails due to duplicate', done => {
    service.register('dup', 'pass1').subscribe(() => {
      service.logout();
      const before = localStorage.getItem('angular_customers');
      service.register('dup', 'pass2').subscribe(() => {
        const after = localStorage.getItem('angular_customers');
        expect(before).toBe(after);
        done();
      });
      const req2 = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
      req2.flush('Username already exists', { status: 409, statusText: 'Conflict' });
    });
    const req1 = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req1.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should handle logout removing localStorage key', () => {
    service.login('admin', 'password').subscribe(() => undefined);
    service.logout();
    expect(localStorage.getItem('angular_auth_user')).toBeNull();
  });

  it('should initialize isAuthenticated as true when user stored', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    localStorage.setItem('angular_auth_user', JSON.stringify({ username: 'test', isAdmin: false }));
    const fresh = TestBed.inject(AuthService);
    expect(fresh.isAuthenticated()).toBe(true);
  });

  it('should initialize user signal correctly when stored', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    localStorage.setItem(
      'angular_auth_user',
      JSON.stringify({ username: 'stored', isAdmin: true })
    );
    const fresh = TestBed.inject(AuthService);
    expect(fresh.user()?.username).toBe('stored');
    expect(fresh.user()?.isAdmin).toBe(true);
  });

  it('should handle empty password registration', done => {
    service.register('user', ' ').subscribe(success => {
      expect(success).toBe(true);
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/register`);
    req.flush('Username already exists', { status: 409, statusText: 'Conflict' });
  });

  it('should handle login with customer that has empty password', done => {
    // register('empty-pw', '') returns false (empty password check)
    // so we manually save the customer to localStorage and test login
    localStorage.setItem(
      'angular_customers',
      JSON.stringify([{ username: 'empty-pw', password: '' }])
    );
    service.login('empty-pw', '').subscribe(success => {
      expect(success).toBe(true);
      done();
    });
    const req = httpMock.expectOne(`${fakestoreAuthUrl}/login`);
    req.flush('Invalid', { status: 401, statusText: 'Unauthorized' });
  });

  it('should return authState as observable that emits current user', () => {
    service.login('admin', 'password').subscribe(() => undefined);
    service.authState.subscribe(user => {
      expect(user?.username).toBe('admin');
      expect(user?.isAdmin).toBe(true);
    });
  });

  it('should return authState as observable that emits null when not logged in', () => {
    service.authState.subscribe(user => {
      expect(user).toBeNull();
    });
  });
});
