import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsersApiService } from '@org/data-access-users-api';
import { UserProfile, UserQuery } from '@org/types';
import { CardComponent } from '@org/ui/components';
import {
  HeaderComponent,
  SidebarComponent,
  type SidebarMenuItem,
  type HeaderMenuItem,
} from '@org/ui/components';
import { AuthService } from '@org/data-access-auth';

@Component({
  selector: 'lib-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardComponent,
    HeaderComponent,
    SidebarComponent,
  ],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListComponent implements OnInit {
  users: UserProfile[] = [];
  loading = false;
  errorMessage = '';
  sidebarCollapsed = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalUsers = 0;

  // Filters
  searchQuery = '';
  roleFilter = '';
  isActiveFilter: boolean | null = null;

  headerMenuItems: HeaderMenuItem[] = [];
  userMenuItems: HeaderMenuItem[] = [
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
  ];

  constructor(
    private usersApi: UsersApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const query: UserQuery = {
      page: this.currentPage,
      limit: this.pageSize,
    };

    if (this.searchQuery) {
      query.search = this.searchQuery;
    }
    if (this.roleFilter) {
      query.role = this.roleFilter;
    }
    if (this.isActiveFilter !== null) {
      query.isActive = this.isActiveFilter;
    }

    this.usersApi.findAll(query).subscribe({
      next: (response) => {
        this.users = response.users;
        this.totalUsers = response.total || response.users.length;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || error.message || 'Failed to load users';
        this.loading = false;
        this.cdr.markForCheck();
        console.error('Error loading users:', error);
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onEdit(user: UserProfile): void {
    this.router.navigate(['/users', user.id, 'edit']);
  }

  onView(user: UserProfile): void {
    this.router.navigate(['/users', user.id]);
  }

  onDelete(user: UserProfile): void {
    if (!confirm(`Are you sure you want to delete user ${user.email}?`)) {
      return;
    }

    this.usersApi.remove(user.id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || error.message || 'Failed to delete user';
        this.cdr.markForCheck();
        console.error('Error deleting user:', error);
      },
    });
  }

  onCreate(): void {
    this.router.navigate(['/users', 'new']);
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
        this.router.navigate(['/auth/login']);
      },
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalUsers / this.pageSize);
  }
}
