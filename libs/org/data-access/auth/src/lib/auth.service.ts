import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { HttpClientService } from '@org/api-client';
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  User,
  UserProfile,
} from '@org/types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  public isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(private authApi: AuthApiService, private http: HttpClientService) {
    this.checkAuth();
  }

  private checkAuth(): void {
    const token = this.http.getToken();
    if (token) {
      this.loadProfile().subscribe({
        next: (user) => {
          this.userSubject.next(user);
          this.isAuthenticated$.next(true);
        },
        error: () => {
          this.clearAuth();
        },
      });
    } else {
      this.clearAuth();
    }
  }

  private loadProfile(): Observable<User> {
    return this.authApi.getProfile().pipe(
      map((profile: UserProfile) => {
        const user: User = {
          id: profile.id,
          email: profile.email,
          username: profile.username,
          firstName: profile.firstName,
          lastName: profile.lastName,
          roles: profile.roles.map((role: string) => ({
            id: role,
            name: role,
            permissions: [],
          })),
          isActive: profile.isActive,
          createdAt:
            profile.createdAt instanceof Date ? profile.createdAt : new Date(profile.createdAt),
          updatedAt:
            profile.updatedAt instanceof Date ? profile.updatedAt : new Date(profile.updatedAt),
        };
        this.userSubject.next(user);
        this.isAuthenticated$.next(true);
        return user;
      }),
      catchError((error) => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  login(loginDto: LoginDto): Observable<AuthResponse> {
    return this.authApi.login(loginDto).pipe(
      tap((response) => {
        this.setAuth(response);
      }),
      catchError((error) => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  register(registerDto: RegisterDto): Observable<AuthResponse> {
    return this.authApi.register(registerDto).pipe(
      tap((response) => {
        this.setAuth(response);
      }),
      catchError((error) => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.http.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.authApi.refreshToken({ refreshToken }).pipe(
      tap((response) => {
        this.setAuth(response);
      }),
      catchError((error) => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    const refreshToken = this.http.getRefreshToken();
    return this.authApi.logout(refreshToken || undefined).pipe(
      tap(() => {
        this.clearAuth();
      }),
      catchError((error) => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  changePassword(changePasswordDto: ChangePasswordDto): Observable<void> {
    return this.authApi.changePassword(changePasswordDto);
  }

  forgotPassword(forgotPasswordDto: ForgotPasswordDto): Observable<void> {
    return this.authApi.forgotPassword(forgotPasswordDto);
  }

  resetPassword(resetPasswordDto: ResetPasswordDto): Observable<void> {
    return this.authApi.resetPassword(resetPasswordDto);
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticated$.value;
  }

  private setAuth(response: AuthResponse): void {
    this.http.setToken(response.accessToken);
    this.http.setRefreshToken(response.refreshToken);
    this.userSubject.next(response.user);
    this.isAuthenticated$.next(true);
  }

  private clearAuth(): void {
    this.http.clearTokens();
    this.userSubject.next(null);
    this.isAuthenticated$.next(false);
  }
}
