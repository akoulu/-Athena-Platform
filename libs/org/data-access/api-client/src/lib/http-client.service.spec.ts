import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientService, ApiError } from './http-client.service';
import { HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

describe('HttpClientService', () => {
  let service: HttpClientService;
  let httpMock: HttpTestingController;
  let localStorageMock: Storage;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpClientService],
    });

    service = TestBed.inject(HttpClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with token from localStorage', () => {
      // Reset mocks
      jest.clearAllMocks();
      (localStorageMock.getItem as jest.Mock).mockReturnValue('initial-token');

      // Create a new service instance to test constructor
      const http = TestBed.inject(HttpClient);
      const newService = new HttpClientService(http);

      expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken');
      expect(newService.getToken()).toBe('initial-token');
    });

    it('should initialize without token when localStorage is empty', () => {
      // Reset mocks
      jest.clearAllMocks();
      (localStorageMock.getItem as jest.Mock).mockReturnValue(null);

      // Create a new service instance to test constructor
      const http = TestBed.inject(HttpClient);
      const newService = new HttpClientService(http);

      expect(newService.getToken()).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return current token', () => {
      service.setToken('test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null when no token is set', () => {
      service.clearTokens();
      expect(service.getToken()).toBeNull();
    });
  });

  describe('setToken', () => {
    it('should save token to localStorage and update subject', async () => {
      service.setToken('new-token');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'new-token');
      expect(service.getToken()).toBe('new-token');

      // Verify subject was updated
      const receivedToken = await firstValueFrom(service.token$);
      expect(receivedToken).toBe('new-token');
    });

    it('should remove token from localStorage when set to null', async () => {
      service.setToken('existing-token');
      service.setToken(null);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(service.getToken()).toBeNull();

      // Verify subject was updated
      const receivedToken = await firstValueFrom(service.token$);
      expect(receivedToken).toBeNull();
    });
  });

  describe('setRefreshToken', () => {
    it('should save refresh token to localStorage', () => {
      service.setRefreshToken('refresh-token');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
    });

    it('should remove refresh token from localStorage when set to null', () => {
      service.setRefreshToken('refresh-token');
      service.setRefreshToken(null);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token from localStorage', () => {
      (localStorageMock.getItem as jest.Mock).mockReturnValue('refresh-token');

      expect(service.getRefreshToken()).toBe('refresh-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('clearTokens', () => {
    it('should remove all tokens from localStorage and update subject', async () => {
      service.setToken('token');
      service.setRefreshToken('refresh-token');
      service.clearTokens();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(service.getToken()).toBeNull();

      // Verify subject was updated
      const receivedToken = await firstValueFrom(service.token$);
      expect(receivedToken).toBeNull();
    });
  });

  describe('getHeaders', () => {
    it('should include Authorization header when token is set', () => {
      service.setToken('test-token');
      const headers = (service as unknown as { getHeaders: () => HttpHeaders }).getHeaders();

      expect(headers.get('Authorization')).toBe('Bearer test-token');
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should not include Authorization header when token is not set', () => {
      service.clearTokens();
      const headers = (service as unknown as { getHeaders: () => HttpHeaders }).getHeaders();

      expect(headers.get('Authorization')).toBeNull();
      expect(headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('HTTP methods', () => {
    describe('get', () => {
      it('should make GET request with correct headers', () => {
        service.setToken('test-token');
        const testData = { id: 1, name: 'Test' };

        service.get<typeof testData>('/test').subscribe((data) => {
          expect(data).toEqual(testData);
        });

        const req = httpMock.expectOne('http://localhost:3000/api/test');
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
        expect(req.request.headers.get('Content-Type')).toBe('application/json');
        req.flush(testData);
      });

      it('should use custom headers when provided', () => {
        const customHeaders = new HttpHeaders({ 'X-Custom-Header': 'value' });
        service.get('/test', { headers: customHeaders }).subscribe();

        const req = httpMock.expectOne('http://localhost:3000/api/test');
        expect(req.request.headers.get('X-Custom-Header')).toBe('value');
        req.flush({});
      });
    });

    describe('post', () => {
      it('should make POST request with body', () => {
        const body = { name: 'Test' };
        const response = { id: 1, ...body };

        service.post('/test', body).subscribe((data) => {
          expect(data).toEqual(response);
        });

        const req = httpMock.expectOne('http://localhost:3000/api/test');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(body);
        req.flush(response);
      });
    });

    describe('patch', () => {
      it('should make PATCH request with body', () => {
        const body = { name: 'Updated' };
        const response = { id: 1, ...body };

        service.patch('/test/1', body).subscribe((data) => {
          expect(data).toEqual(response);
        });

        const req = httpMock.expectOne('http://localhost:3000/api/test/1');
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(body);
        req.flush(response);
      });
    });

    describe('put', () => {
      it('should make PUT request with body', () => {
        const body = { name: 'Replaced' };
        const response = { id: 1, ...body };

        service.put('/test/1', body).subscribe((data) => {
          expect(data).toEqual(response);
        });

        const req = httpMock.expectOne('http://localhost:3000/api/test/1');
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(body);
        req.flush(response);
      });
    });

    describe('delete', () => {
      it('should make DELETE request', () => {
        service.delete('/test/1').subscribe();

        const req = httpMock.expectOne('http://localhost:3000/api/test/1');
        expect(req.request.method).toBe('DELETE');
        req.flush({});
      });
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors with message', (done) => {
      service.get('/error').subscribe({
        next: () => {
          done.fail('Should have thrown error');
        },
        error: (error: ApiError) => {
          expect(error.status).toBe(404);
          expect(error.message).toBe('Not found');
          done();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/error');
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should handle HTTP errors with errors object', (done) => {
      service.post('/error', {}).subscribe({
        next: () => {
          done.fail('Should have thrown error');
        },
        error: (error: ApiError) => {
          expect(error.status).toBe(400);
          expect(error.errors).toEqual({
            email: ['Email is required'],
            password: ['Password is too short'],
          });
          done();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/error');
      req.flush(
        {
          message: 'Validation failed',
          errors: {
            email: ['Email is required'],
            password: ['Password is too short'],
          },
        },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should use default message when error message is missing', (done) => {
      service.get('/error', { retry: 0 }).subscribe({
        next: () => {
          done.fail('Should have thrown error');
        },
        error: (error: ApiError) => {
          expect(error.message).toBe('An error occurred');
          done();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/error');
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('retry logic', () => {
    it('should not retry when retry is disabled', (done) => {
      service.get('/server-error', { retry: 0 }).subscribe({
        next: () => {
          done.fail('Should have thrown error');
        },
        error: () => {
          done();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/server-error');
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should not retry on 4xx errors except 408 and 429', (done) => {
      service.get('/client-error', { retry: 0 }).subscribe({
        next: () => {
          done.fail('Should have thrown error');
        },
        error: () => {
          done();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/client-error');
      req.flush(null, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle network errors', (done) => {
      service.get('/network-error', { retry: 0 }).subscribe({
        next: () => {
          done.fail('Should have thrown error');
        },
        error: () => {
          done();
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/network-error');
      req.error(new ProgressEvent('error'), { status: 0 });
    });
  });
});
