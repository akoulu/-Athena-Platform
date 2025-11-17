import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, EMPTY } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { HttpClientService } from '@org/api-client';

@Injectable()
export class TokenRefreshInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(
    null
  );

  constructor(private authService: AuthService, private http: HttpClientService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only handle 401 errors
        if (
          error.status === 401 &&
          !request.url.includes('/auth/refresh') &&
          !request.url.includes('/auth/login')
        ) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.http.getRefreshToken();
      if (!refreshToken) {
        this.isRefreshing = false;
        // No refresh token, redirect to login
        this.http.clearTokens();
        return EMPTY;
      }

      return this.authService.refreshToken().pipe(
        switchMap((response) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.accessToken);

          // Retry the original request with new token
          return next.handle(this.addTokenHeader(request, response.accessToken));
        }),
        catchError(() => {
          this.isRefreshing = false;
          this.http.clearTokens();
          this.refreshTokenSubject.next(null);
          // Redirect to login on refresh failure
          return EMPTY;
        })
      );
    } else {
      // If refresh is in progress, wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => {
          if (!token) {
            return EMPTY;
          }
          return next.handle(this.addTokenHeader(request, token));
        })
      );
    }
  }

  private addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
