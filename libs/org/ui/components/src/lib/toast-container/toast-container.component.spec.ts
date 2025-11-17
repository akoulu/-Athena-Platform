import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastContainerComponent } from './toast-container.component';

describe('ToastContainerComponent', () => {
  let component: ToastContainerComponent;
  let fixture: ComponentFixture<ToastContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add toast', () => {
    const toastId = component.addToast({
      message: 'Test message',
      type: 'success',
    });
    expect(toastId).toBeTruthy();
    expect(component.toasts.length).toBe(1);
    expect(component.toasts[0].message).toBe('Test message');
  });

  it('should remove toast', () => {
    const toastId = component.addToast({
      message: 'Test message',
      type: 'success',
    });
    component.removeToast(toastId);
    expect(component.toasts.length).toBe(0);
  });

  describe('Integration Tests - Full Flow', () => {
    it('should complete full toast flow: add -> display -> auto-remove', () => {
      // Add toast
      const toastId = component.addToast({
        message: 'Success message',
        type: 'success',
        duration: 1000,
        closable: true,
      });

      expect(component.toasts.length).toBe(1);
      expect(component.toasts[0].id).toBe(toastId);
      expect(component.toasts[0].message).toBe('Success message');
      expect(component.toasts[0].type).toBe('success');

      // Remove toast
      component.onToastClose(toastId);
      expect(component.toasts.length).toBe(0);
    });

    it('should handle multiple toasts', () => {
      const id1 = component.addToast({ message: 'First', type: 'info' });
      const id2 = component.addToast({ message: 'Second', type: 'warning' });
      const id3 = component.addToast({ message: 'Third', type: 'error' });

      expect(component.toasts.length).toBe(3);
      expect(component.toasts[0].message).toBe('First');
      expect(component.toasts[1].message).toBe('Second');
      expect(component.toasts[2].message).toBe('Third');

      // Remove middle toast
      component.removeToast(id2);
      expect(component.toasts.length).toBe(2);
      expect(component.toasts[0].id).toBe(id1);
      expect(component.toasts[1].id).toBe(id3);
    });

    it('should handle all toast types', () => {
      const types: Array<'success' | 'error' | 'warning' | 'info'> = [
        'success',
        'error',
        'warning',
        'info',
      ];

      types.forEach((type) => {
        component.addToast({ message: `${type} message`, type });
      });

      expect(component.toasts.length).toBe(4);
      types.forEach((type, index) => {
        expect(component.toasts[index].type).toBe(type);
      });
    });

    it('should handle toast with custom duration and closable', () => {
      const toastId = component.addToast({
        message: 'Custom toast',
        type: 'info',
        duration: 5000,
        closable: false,
      });

      const toast = component.toasts.find((t) => t.id === toastId);
      expect(toast?.duration).toBe(5000);
      expect(toast?.closable).toBe(false);
    });
  });
});
