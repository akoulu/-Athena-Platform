import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@org/data-access-auth';
import { ForgotPasswordDto } from '@org/types';

@Component({
  selector: 'lib-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.isLoading || !this.forgotPasswordForm) {
      return;
    }
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const forgotPasswordDto: ForgotPasswordDto = {
      email: this.forgotPasswordForm.value.email,
    };

    this.authService.forgotPassword(forgotPasswordDto).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage =
          'If an account with that email exists, a password reset link has been sent.';
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        // Don't reveal if user exists (security best practice)
        this.successMessage =
          'If an account with that email exists, a password reset link has been sent.';
        this.cdr.markForCheck();
        console.error('Forgot password error:', error);
      },
    });
  }
}
