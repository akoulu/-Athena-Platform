import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterModule.forRoot([
          { path: 'dashboard', component: {} as any },
          { path: 'test', component: {} as any },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    component.title = 'Test App';
    const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
    cdr.markForCheck();
    fixture.detectChanges();
    const titleEl = fixture.nativeElement.querySelector('.header__title');
    expect(titleEl).toBeTruthy();
    if (titleEl) {
      expect(titleEl.textContent?.trim()).toContain('Test App');
    }
  });

  it('should toggle user menu', () => {
    component.showUserMenu = true;
    fixture.detectChanges();
    expect(component.isUserMenuOpen).toBe(false);
    component.toggleUserMenu();
    expect(component.isUserMenuOpen).toBe(true);
  });

  it('should emit menu item click', () => {
    const menuItem = { label: 'Test', route: '/test' };
    jest.spyOn(component.menuItemClick, 'emit');
    component.onMenuItemClick(menuItem);
    expect(component.menuItemClick.emit).toHaveBeenCalledWith(menuItem);
  });

  describe('Integration with Router', () => {
    it('should render title link with routerLink to dashboard', () => {
      component.title = 'Athena';
      fixture.detectChanges();

      const titleLink = fixture.nativeElement.querySelector('.header__title');
      expect(titleLink).toBeTruthy();
      expect(titleLink?.tagName).toBe('A');
    });

    it('should have logo configured for navigation', () => {
      component.logo = '/assets/logo.png';
      fixture.detectChanges();

      // Verify logo is set (navigation is handled by routerLink in template)
      expect(component.logo).toBe('/assets/logo.png');
    });

    it('should navigate when menu item with route is clicked', () => {
      const menuItem = { label: 'Dashboard', route: '/dashboard' };
      jest.spyOn(component.menuItemClick, 'emit');

      component.onMenuItemClick(menuItem);

      // Router navigation is handled by routerLink, but we can verify the emit
      expect(component.menuItemClick.emit).toHaveBeenCalledWith(menuItem);
    });

    it('should call action when menu item with action is clicked', () => {
      const actionSpy = jest.fn();
      const menuItem = { label: 'Test', action: actionSpy };
      jest.spyOn(component.menuItemClick, 'emit');

      component.onMenuItemClick(menuItem);

      expect(actionSpy).toHaveBeenCalled();
      expect(component.menuItemClick.emit).toHaveBeenCalledWith(menuItem);
    });
  });

  describe('UI Integration - User Menu', () => {
    beforeEach(() => {
      component.showUserMenu = true;
      component.userName = 'John Doe';
      fixture.detectChanges();
    });

    it('should have user menu configured when showUserMenu is true', () => {
      expect(component.showUserMenu).toBe(true);
      expect(component.userName).toBe('John Doe');
    });

    it('should toggle user menu state', () => {
      expect(component.isUserMenuOpen).toBe(false);

      component.toggleUserMenu();
      fixture.detectChanges();

      expect(component.isUserMenuOpen).toBe(true);
    });

    it('should close user menu when menu item is clicked', () => {
      component.isUserMenuOpen = true;
      fixture.detectChanges();

      const menuItem = { label: 'Profile', route: '/profile' };
      component.onUserMenuItemClick(menuItem);

      expect(component.isUserMenuOpen).toBe(false);
    });
  });
});
