import { ErrorHandler, Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private router = inject(Router);

  handleError(error: Error | HttpErrorResponse): void {
    let errorMessage = 'An unexpected error occurred';
    let errorDetails: any = null;

    if (error instanceof HttpErrorResponse) {
      // Server-side error
      if (error.error instanceof ErrorEvent) {
        // Client-side network error
        errorMessage = `Network error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage = error.error?.message || error.message || `Server error: ${error.status}`;
        errorDetails = {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
        };
      }
    } else {
      // Client-side error
      errorMessage = error.message || errorMessage;
      errorDetails = {
        stack: error.stack,
      };
    }

    // Log error to console (in production, this should be sent to a logging service)
    console.error('Global error handler:', {
      message: errorMessage,
      error,
      details: errorDetails,
      timestamp: new Date().toISOString(),
    });

    // Handle specific error cases
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        // Unauthorized - redirect to login
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: this.router.url },
        });
        return;
      }

      if (error.status === 403) {
        // Forbidden - show access denied message
        errorMessage = 'You do not have permission to access this resource';
      }

      if (error.status === 404) {
        // Not found
        errorMessage = 'The requested resource was not found';
      }

      if (error.status >= 500) {
        // Server error
        errorMessage = 'A server error occurred. Please try again later.';
      }
    }

    // In a real application, you might want to:
    // 1. Send error to a logging service (e.g., Sentry, LogRocket)
    // 2. Show a user-friendly error notification
    // 3. Track error metrics

    // For now, we'll just log it
    // You can inject a notification service here to show toast messages
  }
}
