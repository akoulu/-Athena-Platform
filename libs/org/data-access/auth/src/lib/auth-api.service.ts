import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '@org/api-client';
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshTokenDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UserProfile,
} from '@org/types';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly baseUrl = '/auth';

  constructor(private http: HttpClientService) {}

  login(loginDto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, loginDto);
  }

  register(registerDto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, registerDto);
  }

  refreshToken(refreshTokenDto: RefreshTokenDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, refreshTokenDto);
  }

  logout(refreshToken?: string): Observable<void> {
    const body = refreshToken ? { refreshToken } : {};
    return this.http.post<void>(`${this.baseUrl}/logout`, body);
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/profile`);
  }

  changePassword(changePasswordDto: ChangePasswordDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/change-password`, changePasswordDto);
  }

  forgotPassword(forgotPasswordDto: ForgotPasswordDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/forgot-password`, forgotPasswordDto);
  }

  resetPassword(resetPasswordDto: ResetPasswordDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reset-password`, resetPasswordDto);
  }
}
