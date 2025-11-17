import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply correct variant classes', () => {
    component.variant = 'dots';
    fixture.detectChanges();
    expect(component.loadingClasses).toContain('loading--dots');
  });

  it('should apply correct size classes', () => {
    component.size = 'lg';
    fixture.detectChanges();
    expect(component.loadingClasses).toContain('loading--lg');
  });

  it('should apply full-screen class when fullScreen is true', () => {
    component.fullScreen = true;
    fixture.detectChanges();
    expect(component.loadingClasses).toContain('loading--full-screen');
  });

  it('should display message when provided', () => {
    component.message = 'Loading...';
    const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
    cdr.markForCheck();
    fixture.detectChanges();
    const messageEl = fixture.nativeElement.querySelector('.loading__message');
    expect(messageEl).toBeTruthy();
    if (messageEl) {
      expect(messageEl.textContent?.trim()).toContain('Loading...');
    }
  });
});
