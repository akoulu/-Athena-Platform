import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '@org/data-access-auth';
import { BehaviorSubject } from 'rxjs';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: jest.Mocked<Router>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;

  beforeEach(() => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(true);

    const mockAuthService = {
      isAuthenticated: jest.fn(),
      isAuthenticated$: isAuthenticatedSubject.asObservable(),
    };

    const mockRouter = {
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router) as jest.Mocked<Router>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when user is authenticated', (done) => {
      isAuthenticatedSubject.next(true);
      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/dashboard' } as RouterStateSnapshot;

      guard.canActivate(route, state).subscribe({
        next: (result) => {
          expect(result).toBe(true);
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should redirect to login when user is not authenticated', (done) => {
      isAuthenticatedSubject.next(false);
      const route = {} as ActivatedRouteSnapshot;
      const state = { url: '/dashboard' } as RouterStateSnapshot;

      guard.canActivate(route, state).subscribe({
        next: (result) => {
          expect(result).toBe(false);
          expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
            queryParams: { returnUrl: '/dashboard' },
          });
          done();
        },
      });
    });
  });
});
