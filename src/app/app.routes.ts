import { Route } from '@angular/router';
import {
  LoginComponent,
  RegisterComponent,
  ForgotPasswordComponent,
  ResetPasswordComponent,
  ChangePasswordComponent,
} from '@org/feature-auth';
import { DashboardComponent } from '@org/feature-dashboard';
import { UsersListComponent, UserFormComponent, UserDetailComponent } from '@org/feature-users';
import { AuthGuard, RoleGuard } from '@org/util-guards';

export const appRoutes: Route[] = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'users',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: '',
        component: UsersListComponent,
      },
      {
        path: 'new',
        component: UserFormComponent,
      },
      {
        path: ':id',
        component: UserDetailComponent,
      },
      {
        path: ':id/edit',
        component: UserFormComponent,
      },
    ],
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
];
