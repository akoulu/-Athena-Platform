import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply correct variant classes', () => {
    component.variant = 'elevated';
    fixture.detectChanges();
    expect(component.cardClasses).toContain('card--elevated');
  });

  it('should apply correct padding classes', () => {
    component.padding = 'lg';
    fixture.detectChanges();
    expect(component.cardClasses).toContain('card--padding-lg');
  });

  it('should apply clickable class when clickable is true', () => {
    component.clickable = true;
    fixture.detectChanges();
    expect(component.cardClasses).toContain('card--clickable');
  });

  it('should display title and subtitle', () => {
    component.title = 'Test Title';
    component.subtitle = 'Test Subtitle';
    const cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
    cdr.markForCheck();
    fixture.detectChanges();
    const titleEl = fixture.nativeElement.querySelector('.card__title');
    const subtitleEl = fixture.nativeElement.querySelector('.card__subtitle');
    expect(titleEl).toBeTruthy();
    expect(subtitleEl).toBeTruthy();
    if (titleEl) {
      expect(titleEl.textContent?.trim()).toContain('Test Title');
    }
    if (subtitleEl) {
      expect(subtitleEl.textContent?.trim()).toContain('Test Subtitle');
    }
  });
});
