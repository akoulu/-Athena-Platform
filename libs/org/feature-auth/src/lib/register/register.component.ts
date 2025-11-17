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
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@org/data-access-auth';
import { RegisterDto } from '@org/types';

@Component({
  selector: 'lib-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        firstName: [''],
        lastName: [''],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.isLoading || !this.registerForm) {
      // Ignore duplicate submits or missing form instance
    } else if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      const firstInvalidKey = Object.keys(this.registerForm.controls).find(
        (k) => this.registerForm.get(k)?.invalid
      );
      if (firstInvalidKey) {
        const el = document.getElementById(firstInvalidKey);
        if (el) {
          (el as HTMLElement).focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } else {
      this.isLoading = true;
      this.errorMessage = '';
      this.cdr.markForCheck();

      const registerDto: RegisterDto = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        username: this.registerForm.value.username,
        firstName: this.registerForm.value.firstName || undefined,
        lastName: this.registerForm.value.lastName || undefined,
      };

      this.authService.register(registerDto).subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage =
            error.error?.message || error.message || 'Registration failed. Please try again.';
          this.cdr.markForCheck();
          console.error('Registration error:', error);
        },
      });
    }
  }
}
