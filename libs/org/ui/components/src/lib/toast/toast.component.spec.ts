import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display message', () => {
    component.message = 'Test message';
    const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
    cdr.markForCheck();
    fixture.detectChanges();
    const messageEl = fixture.nativeElement.querySelector('.toast__message');
    expect(messageEl).toBeTruthy();
    if (messageEl) {
      expect(messageEl.textContent?.trim()).toContain('Test message');
    }
  });

  it('should apply correct type classes', () => {
    component.type = 'success';
    fixture.detectChanges();
    expect(component.toastClasses).toContain('toast--success');

    component.type = 'error';
    fixture.detectChanges();
    expect(component.toastClasses).toContain('toast--error');
  });

  it('should show correct icon for type', () => {
    component.type = 'success';
    fixture.detectChanges();
    expect(component.icon).toBe('✓');

    component.type = 'error';
    fixture.detectChanges();
    expect(component.icon).toBe('✕');
  });

  it('should emit close when close button is clicked', () => {
    component.closable = true;
    component.message = 'Test'; // Need message for component to render
    const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
    cdr.markForCheck();
    fixture.detectChanges();
    jest.spyOn(component.closeEvent, 'emit');
    const closeBtn = fixture.nativeElement.querySelector('.toast__close');
    expect(closeBtn).toBeTruthy();
    if (closeBtn) {
      closeBtn.click();
      expect(component.closeEvent.emit).toHaveBeenCalled();
    }
  });

  it('should auto-close after duration', (done) => {
    component.duration = 100;
    component.ngOnInit();
    jest.spyOn(component, 'onClose');
    setTimeout(() => {
      expect(component.onClose).toHaveBeenCalled();
      done();
    }, 150);
  });
});
