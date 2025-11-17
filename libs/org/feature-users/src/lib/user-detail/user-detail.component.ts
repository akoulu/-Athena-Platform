import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UsersApiService } from '@org/data-access-users-api';
import { UserProfile } from '@org/types';
import { CardComponent } from '@org/ui/components';

@Component({
  selector: 'lib-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent implements OnInit {
  user: UserProfile | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private usersApi: UsersApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    }
  }

  loadUser(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.usersApi.findOne(id).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || error.message || 'Failed to load user';
        this.loading = false;
        this.cdr.markForCheck();
        console.error('Error loading user:', error);
      },
    });
  }

  onEdit(): void {
    if (this.user) {
      this.router.navigate(['/users', this.user.id, 'edit']);
    }
  }

  onBack(): void {
    this.router.navigate(['/users']);
  }
}
