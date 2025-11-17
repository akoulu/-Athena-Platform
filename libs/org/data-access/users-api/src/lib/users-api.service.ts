import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '@org/api-client';
import { CreateUserDto, UpdateUserDto, UserProfile, UserQuery, UserListResponse } from '@org/types';

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  private readonly baseUrl = '/users';

  constructor(private http: HttpClientService) {}

  create(createUserDto: CreateUserDto): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.baseUrl, createUserDto);
  }

  findAll(query?: UserQuery): Observable<UserListResponse> {
    const params = query
      ? Object.entries(query)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
          .join('&')
      : '';
    const url = params ? `${this.baseUrl}?${params}` : this.baseUrl;
    return this.http.get<UserListResponse>(url);
  }

  findOne(id: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/${id}`);
  }

  update(id: string, updateUserDto: UpdateUserDto): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.baseUrl}/${id}`, updateUserDto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
