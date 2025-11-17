import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '@org/data-access-auth';
import { HttpClientService } from '@org/api-client';
import { User } from '@org/types';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let router: Router;
  let authService: jest.Mocked<AuthService>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    roles: [{ id: 'user', name: 'user', permissions: [] }],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockHttpClientService = {
      getToken: jest.fn().mockReturnValue('mock-token'),
      getRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
      setToken: jest.fn(),
      setRefreshToken: jest.fn(),
      clearTokens: jest.fn(),
    };

    const mockAuthService = {
      logout: jest.fn().mockReturnValue(of(undefined)),
      getCurrentUser: jest.fn().mockReturnValue(mockUser),
      isAuthenticated: jest.fn().mockReturnValue(true),
      isAuthenticated$: new BehaviorSubject<boolean>(true),
      user$: new BehaviorSubject<User | null>(mockUser),
    };

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterModule.forRoot([
          { path: 'dashboard', component: DashboardComponent },
          { path: 'auth/login', component: {} as any },
        ]),
        HttpClientTestingModule,
      ],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: HttpClientService,
          useValue: mockHttpClientService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle sidebar collapse', () => {
    component.sidebarCollapsed = false;
    component.onSidebarToggle(true);
    expect(component.sidebarCollapsed).toBe(true);
  });

  it('should have menu items configured', () => {
    expect(component.sidebarMenuItems.length).toBeGreaterThan(0);
    expect(component.userMenuItems.length).toBeGreaterThan(0);
  });

  describe('Integration with AuthService', () => {
    it('should call logout when handleLogout is called', () => {
      authService.logout.mockReturnValue(of(undefined));

      component.handleLogout();

      expect(authService.logout).toHaveBeenCalled();
    });

    it('should navigate to login after successful logout', () => {
      authService.logout.mockReturnValue(of(undefined));
      jest.spyOn(router, 'navigate');

      component.handleLogout();

      // Wait for async operation to complete
      fixture.detectChanges();

      expect(authService.logout).toHaveBeenCalled();
      // Navigation happens in subscribe callback, so we check it was called
      // The actual navigation will happen asynchronously
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should navigate to login even if logout fails', () => {
      authService.logout.mockReturnValue(throwError(() => new Error('Logout failed')));
      jest.spyOn(router, 'navigate');

      component.handleLogout();

      // Wait for async operation to complete
      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });

  describe('Integration with Router - Header Navigation', () => {
    it('should render header with logo link to dashboard', () => {
      const header = fixture.nativeElement.querySelector('lib-header');
      expect(header).toBeTruthy();

      const logoLink = header?.querySelector('a[href="/dashboard"]');
      expect(logoLink).toBeTruthy();
    });

    it('should render header with title link to dashboard', () => {
      const header = fixture.nativeElement.querySelector('lib-header');
      const titleLink = header?.querySelector('.header__title');
      expect(titleLink).toBeTruthy();
      expect(
        titleLink?.getAttribute('href') || titleLink?.getAttribute('ng-reflect-router-link')
      ).toBeTruthy();
    });
  });

  describe('Integration with Router - Sidebar Navigation', () => {
    it('should render sidebar with dashboard menu item', () => {
      const sidebar = fixture.nativeElement.querySelector('lib-sidebar');
      expect(sidebar).toBeTruthy();
    });

    it('should have dashboard route in sidebar menu items', () => {
      const dashboardMenuItem = component.sidebarMenuItems.find(
        (item) => item.label === 'Dashboard'
      );
      expect(dashboardMenuItem).toBeDefined();
      expect(dashboardMenuItem?.route).toBe('/dashboard');
    });
  });

  describe('UI Integration - Sidebar Toggle', () => {
    it('should update sidebar collapsed state when toggle is called', () => {
      const initialState = component.sidebarCollapsed;
      component.onSidebarToggle(!initialState);
      expect(component.sidebarCollapsed).toBe(!initialState);
    });

    it('should trigger change detection when sidebar is toggled', () => {
      // Get the actual ChangeDetectorRef from the component
      const cdr = (component as any).cdr as ChangeDetectorRef;
      jest.spyOn(cdr, 'markForCheck');

      component.onSidebarToggle(true);

      // Change detection should be triggered
      expect(cdr.markForCheck).toHaveBeenCalled();
      expect(component.sidebarCollapsed).toBe(true);
    });
  });

  describe('UI Integration - User Menu', () => {
    it('should have logout item in user menu', () => {
      const logoutItem = component.userMenuItems.find((item) => item.label === 'Logout');
      expect(logoutItem).toBeDefined();
      expect(logoutItem?.action).toBeDefined();
    });

    it('should call handleLogout when logout menu item action is executed', () => {
      const logoutItem = component.userMenuItems.find((item) => item.label === 'Logout');
      jest.spyOn(component, 'handleLogout');

      if (logoutItem?.action) {
        logoutItem.action();
      }

      expect(component.handleLogout).toHaveBeenCalled();
    });
  });
});
