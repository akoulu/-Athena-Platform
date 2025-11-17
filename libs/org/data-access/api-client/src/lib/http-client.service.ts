import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, timer } from 'rxjs';
import { catchError, retryWhen, mergeMap, take } from 'rxjs/operators';
import { environment } from './environment';

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api/v1';
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  setToken(token: string | null): void {
    if (token) {
      localStorage.setItem('accessToken', token);
      this.tokenSubject.next(token);
    } else {
      localStorage.removeItem('accessToken');
      this.tokenSubject.next(null);
    }
  }

  setRefreshToken(token: string | null): void {
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.tokenSubject.next(null);
  }

  private getHeaders(): HttpHeaders {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const apiError: ApiError = {
      message:
        (error.error && typeof error.error === 'object' && error.error.message) ||
        (error.error && typeof error.error === 'string' ? error.error : null) ||
        'An error occurred',
      status: error.status,
      errors: error.error && typeof error.error === 'object' ? error.error.errors : undefined,
    };

    return throwError(() => apiError);
  }

  private shouldRetry(error: HttpErrorResponse, retryCount: number): boolean {
    // Don't retry if max retries reached
    if (retryCount <= 0) {
      return false;
    }

    // Don't retry client errors (4xx) except 408 (Request Timeout) and 429 (Too Many Requests)
    if (error.status >= 400 && error.status < 500) {
      return error.status === 408 || error.status === 429;
    }

    // Retry server errors (5xx) and network errors (status 0)
    return error.status >= 500 || error.status === 0;
  }

  private retryWithBackoff<T>(maxRetries: number, initialDelay = 1000) {
    return (source: Observable<T>) => {
      if (maxRetries === 0) {
        return source;
      }
      return source.pipe(
        retryWhen((errors: Observable<HttpErrorResponse>) =>
          errors.pipe(
            mergeMap((error: HttpErrorResponse, index: number) => {
              const retryCount = maxRetries - index;
              if (!this.shouldRetry(error, retryCount)) {
                return throwError(() => error);
              }

              // Exponential backoff: delay = initialDelay * 2^index
              const delay = initialDelay * Math.pow(2, index);
              return timer(delay);
            }),
            take(maxRetries)
          )
        )
      );
    };
  }

  get<T>(url: string, options?: { headers?: HttpHeaders; retry?: number }): Observable<T> {
    const headers = options?.headers || this.getHeaders();
    const retryCount = options?.retry ?? 3;

    return this.http
      .get<T>(`${this.apiUrl}${url}`, { headers })
      .pipe(this.retryWithBackoff<T>(retryCount), catchError(this.handleError));
  }

  post<T>(
    url: string,
    body: unknown,
    options?: { headers?: HttpHeaders; retry?: number }
  ): Observable<T> {
    const headers = options?.headers || this.getHeaders();
    const retryCount = options?.retry ?? 3;

    return this.http
      .post<T>(`${this.apiUrl}${url}`, body, { headers })
      .pipe(this.retryWithBackoff<T>(retryCount), catchError(this.handleError));
  }

  patch<T>(
    url: string,
    body: unknown,
    options?: { headers?: HttpHeaders; retry?: number }
  ): Observable<T> {
    const headers = options?.headers || this.getHeaders();
    const retryCount = options?.retry ?? 3;

    return this.http
      .patch<T>(`${this.apiUrl}${url}`, body, { headers })
      .pipe(this.retryWithBackoff<T>(retryCount), catchError(this.handleError));
  }

  put<T>(
    url: string,
    body: unknown,
    options?: { headers?: HttpHeaders; retry?: number }
  ): Observable<T> {
    const headers = options?.headers || this.getHeaders();
    const retryCount = options?.retry ?? 3;

    return this.http
      .put<T>(`${this.apiUrl}${url}`, body, { headers })
      .pipe(this.retryWithBackoff<T>(retryCount), catchError(this.handleError));
  }

  delete<T>(url: string, options?: { headers?: HttpHeaders; retry?: number }): Observable<T> {
    const headers = options?.headers || this.getHeaders();
    const retryCount = options?.retry ?? 3;

    return this.http
      .delete<T>(`${this.apiUrl}${url}`, { headers })
      .pipe(this.retryWithBackoff<T>(retryCount), catchError(this.handleError));
  }
}
