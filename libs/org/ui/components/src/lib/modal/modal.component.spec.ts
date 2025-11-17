import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render when isOpen is false', () => {
    component.isOpen = false;
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal-backdrop');
    expect(modal).toBeFalsy();
  });

  it('should render when isOpen is true', () => {
    component.isOpen = true;
    const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
    cdr.markForCheck();
    fixture.detectChanges();
    // Modal uses @if directive, so we need to wait for change detection
    const modal = fixture.nativeElement.querySelector('.modal-backdrop');
    expect(modal).toBeTruthy();
  });

  it('should emit close when backdrop is clicked', () => {
    component.isOpen = true;
    component.closable = true;
    const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
    cdr.markForCheck();
    fixture.detectChanges();
    jest.spyOn(component.closeEvent, 'emit');
    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
    expect(backdrop).toBeTruthy();
    if (backdrop) {
      backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(component.closeEvent.emit).toHaveBeenCalled();
    }
  });

  it('should not close when closable is false', () => {
    component.isOpen = true;
    component.closable = false;
    fixture.detectChanges();
    jest.spyOn(component.closeEvent, 'emit');
    component.onClose();
    expect(component.closeEvent.emit).not.toHaveBeenCalled();
  });

  it('should apply correct size classes', () => {
    component.isOpen = true;
    component.size = 'lg';
    fixture.detectChanges();
    expect(component.modalClasses).toContain('modal--lg');
  });

  describe('Integration Tests - Full Flow', () => {
    it('should complete full modal flow: open -> interact -> close', () => {
      component.isOpen = true;
      component.closable = true;
      component.title = 'Test Modal';
      // Call ngOnInit manually to trigger body scroll disable
      component.ngOnInit();
      const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
      cdr.markForCheck();
      fixture.detectChanges();

      // Verify modal is open and body scroll is disabled
      const modal = fixture.nativeElement.querySelector('.modal-backdrop');
      expect(modal).toBeTruthy();
      expect(document.body.style.overflow).toBe('hidden');

      // Verify confirm button works
      jest.spyOn(component.confirmEvent, 'emit');
      component.onConfirm();
      expect(component.confirmEvent.emit).toHaveBeenCalled();

      // Verify cancel button works
      jest.spyOn(component.cancelEvent, 'emit');
      jest.spyOn(component.closeEvent, 'emit');
      component.onCancel();
      expect(component.cancelEvent.emit).toHaveBeenCalled();
      expect(component.closeEvent.emit).toHaveBeenCalled();
    });

    it('should handle backdrop click integration', () => {
      component.isOpen = true;
      component.closable = true;
      const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
      cdr.markForCheck();
      fixture.detectChanges();

      jest.spyOn(component.closeEvent, 'emit');
      const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');

      if (backdrop) {
        // Simulate backdrop click
        const clickEvent = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(clickEvent, 'target', { value: backdrop, enumerable: true });
        backdrop.dispatchEvent(clickEvent);

        // Verify close was emitted
        expect(component.closeEvent.emit).toHaveBeenCalled();
      }
    });

    it('should restore body scroll on destroy', () => {
      component.isOpen = true;
      // Call ngOnInit manually to trigger body scroll disable
      component.ngOnInit();
      const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
      cdr.markForCheck();
      fixture.detectChanges();

      expect(document.body.style.overflow).toBe('hidden');

      component.ngOnDestroy();

      expect(document.body.style.overflow).toBe('');
    });

    it('should handle multiple size variants', () => {
      const sizes: Array<'sm' | 'md' | 'lg' | 'xl'> = ['sm', 'md', 'lg', 'xl'];

      sizes.forEach((size) => {
        component.size = size;
        expect(component.modalClasses).toContain(`modal--${size}`);
      });
    });

    it('should handle footer visibility integration', () => {
      component.isOpen = true;
      component.showFooter = false;
      const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
      cdr.markForCheck();
      fixture.detectChanges();

      // Footer should not be visible
      const footer = fixture.nativeElement.querySelector('.modal__footer');
      expect(footer).toBeFalsy();
    });
  });
});
