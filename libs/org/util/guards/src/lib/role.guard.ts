import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, map, take, catchError, of } from 'rxjs';
import { AuthService } from '@org/data-access-auth';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      // No roles required, allow access
      return of(true);
    }

    return this.authService.user$.pipe(
      take(1),
      map((user) => {
        if (!user || !user.roles || user.roles.length === 0) {
          // User not authenticated or has no roles
          this.router.navigate(['/dashboard'], {
            queryParams: { error: 'insufficient_permissions' },
          });
          return false;
        }

        // Check if user has at least one of the required roles
        // user.roles is an array of objects with { id, name, permissions }
        const userRoleNames = user.roles.map((r) => (typeof r === 'string' ? r : r.name || r.id));
        const hasRole = requiredRoles.some((role) => userRoleNames.includes(role));

        if (!hasRole) {
          // User doesn't have required role
          this.router.navigate(['/dashboard'], {
            queryParams: { error: 'insufficient_permissions' },
          });
          return false;
        }

        return true;
      }),
      catchError(() => {
        this.router.navigate(['/dashboard'], {
          queryParams: { error: 'insufficient_permissions' },
        });
        return of(false);
      })
    );
  }
}
