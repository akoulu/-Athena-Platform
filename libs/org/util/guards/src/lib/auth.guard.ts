import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, filter, take, of, race, timer } from 'rxjs';
import { AuthService } from '@org/data-access-auth';
import { HttpClientService } from '@org/api-client';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClientService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Check if token exists in localStorage
    const token = this.http.getToken();

    if (!token) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      });
      return of(false);
    }

    // If token exists, wait for authentication check to complete
    // The checkAuth() in AuthService constructor will update isAuthenticated$
    // We wait for the first true value, or timeout after 2 seconds
    const authCheck$ = this.authService.isAuthenticated$.pipe(
      filter((isAuthenticated) => isAuthenticated === true),
      take(1),
      map(() => true)
    );

    const timeout$ = timer(2000).pipe(
      map(() => {
        // On timeout, check current authentication status
        const currentAuth = this.authService.isAuthenticated();
        return currentAuth || token ? true : false;
      })
    );

    return race(authCheck$, timeout$).pipe(
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return true;
        } else {
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }
      })
    );
  }
}
