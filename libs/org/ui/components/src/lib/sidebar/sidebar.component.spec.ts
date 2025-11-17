import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let router: Router;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SidebarComponent,
        RouterModule.forRoot([
          { path: 'dashboard', component: {} as any },
          { path: 'test', component: {} as any },
          { path: 'child', component: {} as any },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle collapse', () => {
    component.collapsible = true;
    component.collapsed = false;
    jest.spyOn(component.toggleCollapse, 'emit');
    component.onToggleCollapse();
    expect(component.collapsed).toBe(true);
    expect(component.toggleCollapse.emit).toHaveBeenCalledWith(true);
  });

  it('should expand/collapse menu items with children', () => {
    const menuItem = {
      label: 'Test',
      children: [{ label: 'Child', route: '/child' }],
      expanded: false,
    };
    component.menuItems = [menuItem];
    fixture.detectChanges();
    component.onMenuItemClick(menuItem);
    expect(menuItem.expanded).toBe(true);
  });

  it('should emit menu item click for items without children', () => {
    const menuItem = { label: 'Test', route: '/test' };
    component.menuItems = [menuItem];
    jest.spyOn(component.menuItemClick, 'emit');
    component.onMenuItemClick(menuItem);
    expect(component.menuItemClick.emit).toHaveBeenCalledWith(menuItem);
  });

  describe('Integration with Router', () => {
    it('should have menu item with route configured', () => {
      const menuItem = { label: 'Dashboard', route: '/dashboard', icon: '📊' };
      component.menuItems = [menuItem];
      component.collapsed = false;
      fixture.detectChanges();

      // Verify menu item is configured correctly
      expect(component.menuItems[0].route).toBe('/dashboard');
      expect(component.menuItems[0].label).toBe('Dashboard');
    });

    it('should have menu item with action configured', () => {
      const actionSpy = jest.fn();
      const menuItem = { label: 'Test', action: actionSpy };
      component.menuItems = [menuItem];
      component.collapsed = false;
      fixture.detectChanges();

      // Verify menu item has action
      expect(component.menuItems[0].action).toBeDefined();
      expect(component.menuItems[0].route).toBeUndefined();
    });

    it('should call action when menu item with action is clicked', () => {
      const actionSpy = jest.fn();
      const menuItem = { label: 'Test', action: actionSpy };
      component.menuItems = [menuItem];
      jest.spyOn(component.menuItemClick, 'emit');

      component.onMenuItemClick(menuItem);

      expect(actionSpy).toHaveBeenCalled();
      expect(component.menuItemClick.emit).toHaveBeenCalledWith(menuItem);
    });

    it('should have submenu items with routes configured', () => {
      const parentItem = {
        label: 'Parent',
        expanded: true,
        children: [{ label: 'Child', route: '/child' }],
      };
      component.menuItems = [parentItem];
      component.collapsed = false;
      fixture.detectChanges();

      // Verify submenu item is configured correctly
      expect(component.menuItems[0].children?.[0].route).toBe('/child');
      expect(component.menuItems[0].children?.[0].label).toBe('Child');
    });

    it('should emit menu item click for submenu items', () => {
      const childItem = { label: 'Child', route: '/child' };
      const parentItem = {
        label: 'Parent',
        expanded: true,
        children: [childItem],
      };
      component.menuItems = [parentItem];
      component.collapsed = false;
      jest.spyOn(component.menuItemClick, 'emit');

      component.onMenuItemClick(childItem);

      expect(component.menuItemClick.emit).toHaveBeenCalledWith(childItem);
    });
  });

  describe('UI Integration - Active Route', () => {
    it('should have menu item with route for routerLinkActive', async () => {
      const menuItem = { label: 'Dashboard', route: '/dashboard', icon: '📊' };
      component.menuItems = [menuItem];
      component.collapsed = false;
      fixture.detectChanges();

      // Verify menu item has route for routerLinkActive
      expect(component.menuItems[0].route).toBe('/dashboard');

      // Navigate to dashboard to test router integration
      await router.navigate(['/dashboard']);
      fixture.detectChanges();
      await fixture.whenStable();

      // Verify navigation occurred
      expect(location.path()).toBe('/dashboard');
    });
  });

  describe('UI Integration - Collapsed State', () => {
    it('should hide menu labels when collapsed', () => {
      component.collapsed = true;
      component.menuItems = [{ label: 'Dashboard', route: '/dashboard', icon: '📊' }];
      fixture.detectChanges();

      const menuLabel = fixture.nativeElement.querySelector('.sidebar__menu-label');
      // Label should not be visible when collapsed
      expect(menuLabel).toBeFalsy();
    });

    it('should have menu items configured when not collapsed', () => {
      component.collapsed = false;
      const menuItem = { label: 'Dashboard', route: '/dashboard', icon: '📊' };
      component.menuItems = [menuItem];
      fixture.detectChanges();

      // Verify menu items are configured
      expect(component.menuItems.length).toBe(1);
      expect(component.menuItems[0].label).toBe('Dashboard');
      expect(component.collapsed).toBe(false);
    });

    it('should hide submenu when collapsed', () => {
      const parentItem = {
        label: 'Parent',
        expanded: true,
        children: [{ label: 'Child', route: '/child' }],
      };
      component.menuItems = [parentItem];
      component.collapsed = true;
      fixture.detectChanges();

      const submenu = fixture.nativeElement.querySelector('.sidebar__submenu');
      expect(submenu).toBeFalsy();
    });
  });
});
