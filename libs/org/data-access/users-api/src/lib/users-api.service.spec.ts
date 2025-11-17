import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { UsersApiService } from './users-api.service';
import { HttpClientService } from '@org/api-client';
import { CreateUserDto, UpdateUserDto, UserProfile, UserQuery, UserListResponse } from '@org/types';

describe('UsersApiService', () => {
  let service: UsersApiService;
  let httpClientService: jest.Mocked<HttpClientService>;

  const mockUserProfile: UserProfile = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    roles: ['user'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserListResponse: UserListResponse = {
    users: [mockUserProfile],
    total: 1,
    page: 1,
    limit: 10,
  };

  beforeEach(() => {
    const mockHttpClientService = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UsersApiService,
        {
          provide: HttpClientService,
          useValue: mockHttpClientService,
        },
      ],
    });

    service = TestBed.inject(UsersApiService);
    httpClientService = TestBed.inject(HttpClientService) as jest.Mocked<HttpClientService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'password123',
      username: 'newuser',
      firstName: 'New',
      lastName: 'User',
    };

    it('should call httpClientService.post with correct parameters', (done) => {
      httpClientService.post.mockReturnValue(of(mockUserProfile));

      service.create(createUserDto).subscribe({
        next: (response) => {
          expect(response).toEqual(mockUserProfile);
          expect(httpClientService.post).toHaveBeenCalledWith('/users', createUserDto);
          done();
        },
      });
    });
  });

  describe('findAll', () => {
    it('should call httpClientService.get without query params', (done) => {
      httpClientService.get.mockReturnValue(of(mockUserListResponse));

      service.findAll().subscribe({
        next: (response) => {
          expect(response).toEqual(mockUserListResponse);
          expect(httpClientService.get).toHaveBeenCalledWith('/users');
          done();
        },
      });
    });

    it('should call httpClientService.get with query params', (done) => {
      const query: UserQuery = {
        page: 1,
        limit: 10,
        search: 'test',
        role: 'admin',
        isActive: true,
      };
      httpClientService.get.mockReturnValue(of(mockUserListResponse));

      service.findAll(query).subscribe({
        next: (response) => {
          expect(response).toEqual(mockUserListResponse);
          expect(httpClientService.get).toHaveBeenCalledWith(
            '/users?page=1&limit=10&search=test&role=admin&isActive=true'
          );
          done();
        },
      });
    });

    it('should filter out undefined query params', (done) => {
      const query: UserQuery = {
        page: 1,
        search: 'test',
        role: undefined,
        isActive: undefined,
      };
      httpClientService.get.mockReturnValue(of(mockUserListResponse));

      service.findAll(query).subscribe({
        next: (response) => {
          expect(response).toEqual(mockUserListResponse);
          expect(httpClientService.get).toHaveBeenCalledWith('/users?page=1&search=test');
          done();
        },
      });
    });
  });

  describe('findOne', () => {
    it('should call httpClientService.get with user id', (done) => {
      httpClientService.get.mockReturnValue(of(mockUserProfile));

      service.findOne('user-1').subscribe({
        next: (response) => {
          expect(response).toEqual(mockUserProfile);
          expect(httpClientService.get).toHaveBeenCalledWith('/users/user-1');
          done();
        },
      });
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should call httpClientService.patch with correct parameters', (done) => {
      httpClientService.patch.mockReturnValue(of(mockUserProfile));

      service.update('user-1', updateUserDto).subscribe({
        next: (response) => {
          expect(response).toEqual(mockUserProfile);
          expect(httpClientService.patch).toHaveBeenCalledWith('/users/user-1', updateUserDto);
          done();
        },
      });
    });
  });

  describe('remove', () => {
    it('should call httpClientService.delete with user id', (done) => {
      httpClientService.delete.mockReturnValue(of(undefined));

      service.remove('user-1').subscribe({
        next: () => {
          expect(httpClientService.delete).toHaveBeenCalledWith('/users/user-1');
          done();
        },
      });
    });
  });
});
