import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UsersApiService } from '@org/data-access-users-api';
import { CreateUserDto, UpdateUserDto } from '@org/types';

@Component({
  selector: 'lib-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private usersApi: UsersApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = this.userId !== null && this.userId !== 'new';

    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: [''], // Required only for create
      firstName: [''],
      lastName: [''],
      roles: [['user']],
      isActive: [true],
    });

    if (this.isEditMode && this.userId) {
      this.loadUser();
    } else {
      // Password required for new users
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  loadUser(): void {
    if (!this.userId) return;

    this.loading = true;
    this.cdr.markForCheck();

    this.usersApi.findOne(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          email: user.email,
          username: user.username,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          roles: user.roles || ['user'],
          isActive: user.isActive,
        });
        // Remove password field for edit mode
        this.userForm.removeControl('password');
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  get emailInvalid(): boolean {
    return this.isFieldInvalid('email');
  }

  get emailRequired(): boolean {
    return !!this.userForm.get('email')?.errors?.['required'];
  }

  get emailFormatInvalid(): boolean {
    return !!this.userForm.get('email')?.errors?.['email'];
  }

  get usernameInvalid(): boolean {
    return this.isFieldInvalid('username');
  }

  get usernameRequired(): boolean {
    return !!this.userForm.get('username')?.errors?.['required'];
  }

  get passwordInvalid(): boolean {
    return this.isFieldInvalid('password');
  }

  get passwordRequired(): boolean {
    return !!this.userForm.get('password')?.errors?.['required'];
  }

  get passwordMinLength(): boolean {
    return !!this.userForm.get('password')?.errors?.['minlength'];
  }

  onSubmit(): void {
    if (this.loading || this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const formValue = this.userForm.value;

    if (this.isEditMode && this.userId) {
      const updateDto: UpdateUserDto = {
        email: formValue.email,
        username: formValue.username,
        firstName: formValue.firstName || undefined,
        lastName: formValue.lastName || undefined,
        roles: formValue.roles || ['user'],
        isActive: formValue.isActive,
      };

      this.usersApi.update(this.userId, updateDto).subscribe({
        next: () => {
          this.successMessage = 'User updated successfully';
          this.loading = false;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.router.navigate(['/users']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || error.message || 'Failed to update user';
          this.loading = false;
          this.cdr.markForCheck();
          console.error('Error updating user:', error);
        },
      });
    } else {
      const createDto: CreateUserDto = {
        email: formValue.email,
        username: formValue.username,
        password: formValue.password,
        firstName: formValue.firstName || undefined,
        lastName: formValue.lastName || undefined,
        roles: formValue.roles || ['user'],
      };

      this.usersApi.create(createDto).subscribe({
        next: () => {
          this.successMessage = 'User created successfully';
          this.loading = false;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.router.navigate(['/users']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || error.message || 'Failed to create user';
          this.loading = false;
          this.cdr.markForCheck();
          console.error('Error creating user:', error);
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}
