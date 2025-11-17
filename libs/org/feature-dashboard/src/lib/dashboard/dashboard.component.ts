import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  HeaderComponent,
  SidebarComponent,
  CardComponent,
  type SidebarMenuItem,
  type HeaderMenuItem,
} from '@org/ui/components';
import { AuthService } from '@org/data-access-auth';

@Component({
  selector: 'org-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, CardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  sidebarCollapsed = false;
  loading = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
  ) {}

  headerMenuItems: HeaderMenuItem[] = [
    // Dashboard navigation is handled by logo/title click
    // { label: 'Dashboard', route: '/dashboard', icon: '📊' },
    // { label: 'Demographics', route: '/demographics', icon: '👥' }, // TODO: Add when route is created
  ];

  userMenuItems: HeaderMenuItem[] = [
    // { label: 'Profile', route: '/profile', icon: '👤' }, // TODO: Add when route is created
    // { label: 'Settings', route: '/settings', icon: '⚙️' }, // TODO: Add when route is created
    { label: 'Logout', action: () => this.handleLogout(), icon: '🚪' },
  ];

  sidebarMenuItems: SidebarMenuItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: '📊',
    },
    {
      label: 'Users',
      route: '/users',
      icon: '👥',
    },
    {
      label: 'Demographics',
      icon: '👥',
      action: () => {
        console.warn('Demographics - Coming soon');
        // TODO: Navigate to /demographics when route is created
      },
      children: [
        {
          label: 'Overview',
          icon: '📈',
          action: () => console.warn('Demographics Overview - Coming soon'),
        },
        {
          label: 'Reports',
          icon: '📄',
          action: () => console.warn('Demographics Reports - Coming soon'),
        },
      ],
    },
    {
      label: 'Settings',
      icon: '⚙️',
      action: () => {
        console.warn('Settings - Coming soon');
        // TODO: Navigate to /settings when route is created
      },
    },
  ];

  ngOnInit(): void {
    // Ensure menu items are initialized
    this.cdr.markForCheck();
  }

  onSidebarToggle(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
    this.cdr.markForCheck();
  }

  handleLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Even if logout fails, navigate to login
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
