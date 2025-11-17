import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@org/data-access-auth';
import { ResetPasswordDto } from '@org/types';

@Component({
  selector: 'lib-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  token = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get token from query params
    this.token = this.route.snapshot.queryParams['token'] || '';

    this.resetPasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );

    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token. Please request a new password reset.';
      this.cdr.markForCheck();
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.isLoading || !this.resetPasswordForm || !this.token) {
      return;
    }
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const resetPasswordDto: ResetPasswordDto = {
      token: this.token,
      newPassword: this.resetPasswordForm.value.newPassword,
    };

    this.authService.resetPassword(resetPasswordDto).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password has been reset successfully. Redirecting to login...';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message ||
          error.message ||
          'Failed to reset password. The token may be invalid or expired.';
        this.cdr.markForCheck();
        console.error('Reset password error:', error);
      },
    });
  }
}
